// Turns raw YouTube activity (subscriptions + liked videos, both with real
// timestamps from the API) into a written lifestyle/wellbeing signal — WHEN
// the user tends to be active and what that might mean for sleep/mood/stress
// — powered primarily by Google Gemini (GEMINI_API_KEY_SOCIAL) with fallback
// to GEMINI_API_KEY_REPORTCHAT. OpenRouter has been completely removed.

const GEMINI_MODELS = ["gemini-flash-latest", "gemini-2.5-flash"];

const SEGMENTS = [
  { key: "Late Night (12am-4am)", from: 0, to: 4 },
  { key: "Early Morning (4am-8am)", from: 4, to: 8 },
  { key: "Morning (8am-12pm)", from: 8, to: 12 },
  { key: "Afternoon (12pm-4pm)", from: 12, to: 16 },
  { key: "Evening (4pm-8pm)", from: 16, to: 20 },
  { key: "Night (8pm-12am)", from: 20, to: 24 },
];

function localHour(isoString, timeZone) {
  try {
    const formatted = new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      hour12: false,
      timeZone: timeZone || "UTC",
    }).format(new Date(isoString));
    const hour = parseInt(formatted, 10);
    return Number.isNaN(hour) ? null : hour % 24;
  } catch {
    return null;
  }
}

function buildActivityDistribution(timestamps, timeZone) {
  const counts = SEGMENTS.map(() => 0);
  let total = 0;
  timestamps.forEach((ts) => {
    const hour = localHour(ts, timeZone);
    if (hour === null) return;
    const idx = SEGMENTS.findIndex((s) => hour >= s.from && hour < s.to);
    if (idx !== -1) {
      counts[idx] += 1;
      total += 1;
    }
  });
  if (total === 0) return null;
  return SEGMENTS.map((s, i) => ({
    segment: s.key,
    count: counts[i],
    percentage: Math.round((counts[i] / total) * 100),
  }));
}

const REPLY_SCHEMA = {
  type: "OBJECT",
  properties: {
    activityPattern: {
      type: "STRING",
      description:
        "1-2 sentences describing WHEN this person tends to be active on YouTube, grounded in the actual percentage breakdown provided — name the dominant time segment(s) explicitly.",
    },
    lifestyleSignal: {
      type: "STRING",
      description:
        "1-2 cautious sentences on what that timing pattern might suggest about their daily rhythm, sleep regularity, or downtime (e.g. late-night activity suggesting delayed sleep or revenge bedtime procrastination; mid-day activity suggesting work breaks).",
    },
    contentThemeNote: {
      type: "STRING",
      description:
        "1 sentence characterizing the kinds of channels/videos they engage with (e.g. ambient music, news, learning, gaming, comedy) and how that might relate to their stress-relief or focus habits.",
    },
    summary: {
      type: "STRING",
      description:
        "A 2-3 sentence overarching takeaway synthesizing the timing and the content, written in the second person ('Your activity shows...'). Grounded, compassionate, non-diagnostic.",
    },
  },
  required: ["activityPattern", "lifestyleSignal", "contentThemeNote", "summary"],
};

async function generateWithGemini(apiKey, prompt, signal) {
  for (const model of GEMINI_MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: {
            parts: [
              {
                text: "You are a digital-wellbeing analyst producing one section of a mental health screening report. You are given a real, computed time-of-day breakdown of a user's YouTube activity plus their subscriptions/liked video titles. Write grounded, cautious, non-diagnostic observations — this is a contextual signal, not a clinical finding. Plain prose, no markdown, no lists.",
              },
            ],
          },
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
            thinkingConfig: { thinkingBudget: 0 },
            maxOutputTokens: 350,
            responseMimeType: "application/json",
            responseSchema: REPLY_SCHEMA,
          },
        }),
        signal,
      });

      if (res.ok) {
        const data = await res.json();
        const rawText = data?.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("");
        if (rawText) {
          return JSON.parse(rawText);
        }
      } else {
        console.warn(`[YouTube Insight Gemini ${model}] HTTP error:`, res.status);
      }
    } catch (e) {
      console.warn(`[YouTube Insight Gemini ${model}] error:`, e.message);
    }
  }
  return null;
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { subscriptions = [], likedVideos = [], timezone = "UTC" } = body || {};

  const timestamps = [
    ...subscriptions.map((s) => s.subscribedAt).filter(Boolean),
    ...likedVideos.map((v) => v.likedAt).filter(Boolean),
  ];
  const distribution = buildActivityDistribution(timestamps, timezone);

  if (!distribution) {
    return Response.json({
      activityPattern: "Not enough timestamped activity was available to determine a timing pattern.",
      lifestyleSignal: "",
      contentThemeNote: "",
      summary: "Not enough timestamped YouTube activity (subscriptions/likes) was available to analyze timing patterns.",
      distribution: [],
    });
  }

  // Priority Keys: Primary GEMINI_API_KEY_SOCIAL, fallback GEMINI_API_KEY_REPORTCHAT
  const geminiSocialKey = process.env.GEMINI_API_KEY_SOCIAL || process.env.GEMINI_API_KEY;
  const geminiFallbackKey = process.env.GEMINI_API_KEY_REPORTCHAT;

  if (!geminiSocialKey && !geminiFallbackKey) {
    const top = [...distribution].sort((a, b) => b.percentage - a.percentage)[0];
    return Response.json({
      activityPattern: `Most activity (${top.percentage}%) falls in the "${top.segment}" window.`,
      lifestyleSignal: "",
      contentThemeNote: "",
      summary: `Most YouTube activity (${top.percentage}%) falls in the "${top.segment}" window. (LLM narrative unavailable — no API key configured.)`,
      distribution,
    });
  }

  const subsList = subscriptions.slice(0, 20).map((s) => s.title).join(", ") || "none listed";
  const likedList = likedVideos.slice(0, 15).map((v) => v.title).join(" | ") || "none listed";

  const prompt = `Time-of-day distribution of this user's YouTube activity (subscribing + liking videos), computed from real account timestamps in their local timezone:
${distribution.map((d) => `- ${d.segment}: ${d.percentage}% (${d.count} events)`).join("\n")}

Subscribed channels (sample): ${subsList}
Liked video titles (sample): ${likedList}

Analyze this real activity data and produce the requested fields. Ground every claim in the numbers above — do not invent statistics. Output strictly a JSON object with keys: activityPattern, lifestyleSignal, contentThemeNote, summary.`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);

  try {
    let parsed = null;

    // 1. Primary: GEMINI_API_KEY_SOCIAL
    if (geminiSocialKey) {
      parsed = await generateWithGemini(geminiSocialKey, prompt, controller.signal);
    }

    // 2. Fallback: GEMINI_API_KEY_REPORTCHAT (if social key rate-limits or fails)
    if (!parsed && geminiFallbackKey && geminiFallbackKey !== geminiSocialKey) {
      console.warn("[YouTube Insight] Primary social key failed or rate-limited, engaging fallback key");
      parsed = await generateWithGemini(geminiFallbackKey, prompt, controller.signal);
    }

    if (!parsed) throw new Error("No parseable insight generated");
    return Response.json({ ...parsed, distribution });
  } catch (err) {
    console.error("YouTube insight route error:", err);
    const top = [...distribution].sort((a, b) => b.percentage - a.percentage)[0];
    return Response.json({
      activityPattern: `Most activity (${top.percentage}%) falls in the "${top.segment}" window.`,
      lifestyleSignal: "",
      contentThemeNote: "",
      summary: `Most YouTube activity (${top.percentage}%) falls in the "${top.segment}" window. (Narrative analysis temporarily unavailable.)`,
      distribution,
    });
  } finally {
    clearTimeout(timeoutId);
  }
}
