// Turns the entries extracted from a user's own official Instagram data
// export into a written activity-timing + lifestyle signal powered by
// Google Gemini (GEMINI_API_KEY_SOCIAL) with fallback to GEMINI_API_KEY_REPORTCHAT.
// OpenRouter has been completely removed.

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
        "1-2 sentences describing WHEN this person tends to be active on Instagram, grounded in the actual percentage breakdown provided — name the dominant time segment(s) explicitly.",
    },
    lifestyleSignal: {
      type: "STRING",
      description:
        "1-2 cautious sentences on what that timing pattern might suggest about their daily rhythm, sleep regularity, or downtime (e.g. late-night messaging suggesting delayed sleep or rumination; daytime bursts suggesting social connectivity or work distraction).",
    },
    contentThemeNote: {
      type: "STRING",
      description:
        "1 sentence characterizing the nature of their activity (e.g. mostly messaging close peers, frequent commenting, passive browsing) and what that implies for their social connection profile.",
    },
    summary: {
      type: "STRING",
      description:
        "A 2-3 sentence overarching takeaway synthesizing the timing and the engagement type, written in the second person ('Your activity shows...'). Grounded, compassionate, non-diagnostic.",
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
                text: "You are a digital-wellbeing analyst producing one section of a mental health screening report. You are given a real, computed time-of-day breakdown of a user's Instagram activity. Write grounded, cautious, non-diagnostic observations — this is a contextual signal, not a clinical finding. Plain prose, no markdown, no lists.",
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
        console.warn(`[Instagram Insight Gemini ${model}] HTTP error:`, res.status);
      }
    } catch (e) {
      console.warn(`[Instagram Insight Gemini ${model}] error:`, e.message);
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

  const { items = [], timezone = "UTC" } = body || {};

  const timestamps = items.map((it) => it.timestamp).filter(Boolean);
  const distribution = buildActivityDistribution(timestamps, timezone);

  if (!distribution) {
    return Response.json({
      activityPattern: "Not enough timestamped Instagram activity was found in the archive.",
      lifestyleSignal: "",
      contentThemeNote: "",
      summary: "Not enough timestamped Instagram activity was found in the uploaded archive to analyze timing patterns.",
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
      summary: `Most Instagram activity (${top.percentage}%) falls in the "${top.segment}" window. (LLM narrative unavailable — no API key configured.)`,
      distribution,
    });
  }

  const typeCounts = items.reduce((acc, it) => {
    acc[it.type] = (acc[it.type] || 0) + 1;
    return acc;
  }, {});
  const typeSummary = Object.entries(typeCounts)
    .map(([t, c]) => `${c} ${t}`)
    .join(", ");

  const prompt = `Time-of-day distribution of this user's Instagram activity (messages + comments), computed from real archive timestamps in their local timezone:
${distribution.map((d) => `- ${d.segment}: ${d.percentage}% (${d.count} events)`).join("\n")}

Activity breakdown by type: ${typeSummary || "messages and comments"}
Total archive events analyzed: ${items.length}

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
      console.warn("[Instagram Insight] Primary social key failed or rate-limited, engaging fallback key");
      parsed = await generateWithGemini(geminiFallbackKey, prompt, controller.signal);
    }

    if (!parsed) throw new Error("No parseable insight generated");
    return Response.json({ ...parsed, distribution });
  } catch (err) {
    console.error("Instagram insight route error:", err);
    const top = [...distribution].sort((a, b) => b.percentage - a.percentage)[0];
    return Response.json({
      activityPattern: `Most activity (${top.percentage}%) falls in the "${top.segment}" window.`,
      lifestyleSignal: "",
      contentThemeNote: "",
      summary: `Most Instagram activity (${top.percentage}%) falls in the "${top.segment}" window. (Narrative analysis temporarily unavailable.)`,
      distribution,
    });
  } finally {
    clearTimeout(timeoutId);
  }
}
