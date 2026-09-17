// Report Q&A chatbot — powered primarily by Google Gemini (GEMINI_API_KEY_REPORTCHAT)
// with fallback to GEMINI_API_KEY_SOCIAL and Groq LPU (GROQ_API_KEY).
// Answers patient and clinician questions based on the SHAP report JSON.
// OpenRouter has been completely removed.

const GEMINI_MODELS = ["gemini-flash-latest", "gemini-2.5-flash"];

const GROQ_MODEL = "qwen/qwen3.8-27b";
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

const SYSTEM_PROMPT = `You are the MindCare AI Report Assistant — a warm, clear, compassionate guide helping the
patient or clinician understand the mental health screening report reproduced below as JSON.

Rules:
- Ground every answer in the actual numbers, condition names, SHAP features,
  evidence quotes, and recommendations in the report JSON. Reference specifics
  (scores, feature names, quotes) rather than speaking generically.
- When asked what to focus on, prioritize by risk: highest-severity conditions
  and highest-priority recommendations first.
- Keep replies conversational, empathetic, and concise — a few sentences to a short
  paragraph. Plain prose, no markdown headers or bullet-heavy formatting.
- Language: If the user asks in Hindi, answer in clear Hindi (Devanagari script). If in Marathi, answer in Marathi (Devanagari script). If in English, answer in English.
- This is a screening aid, not a diagnosis. Never present the report as a
  clinical diagnosis; if the user seems distressed or asks about a crisis,
  gently encourage them to reach out to a licensed professional or emergency services.
- If asked something the report doesn't cover, say so plainly instead of
  inventing details.`;

async function callGemini(apiKey, systemText, contents, signal) {
  for (const model of GEMINI_MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemText }] },
          contents,
          generationConfig: {
            temperature: 0.6,
            maxOutputTokens: 450,
          },
        }),
        signal,
      });

      if (res.ok) {
        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("");
        if (text && text.trim()) return text.trim();
      } else {
        console.warn(`[Gemini ReportChat ${model}] HTTP error:`, res.status);
      }
    } catch (e) {
      console.warn(`[Gemini ReportChat ${model}] exception:`, e.message);
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

  const { report, question, history } = body || {};
  if (!report || typeof question !== "string" || !question.trim()) {
    return Response.json(
      { error: "report and a non-empty question are required" },
      { status: 400 }
    );
  }

  // Priority Keys
  const geminiReportKey = process.env.GEMINI_API_KEY_REPORTCHAT || process.env.GEMINI_API_KEY;
  const geminiSocialKey = process.env.GEMINI_API_KEY_SOCIAL;
  const groqKey = process.env.GROQ_API_KEY || process.env.GROQ_API_KEY_ASSESSMENT;

  if (!geminiReportKey && !geminiSocialKey && !groqKey) {
    return Response.json({
      reply: "The report assistant isn't configured yet — please configure GEMINI_API_KEY_REPORTCHAT or GROQ_API_KEY in .env.local.",
    });
  }

  const systemText = `${SYSTEM_PROMPT}\n\nREPORT DATA (JSON):\n${JSON.stringify(report)}`;

  // Convert history to Gemini contents format
  const geminiContents = [];
  if (Array.isArray(history)) {
    for (const m of history) {
      geminiContents.push({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: String(m.text || m.content || "") }],
      });
    }
  }
  geminiContents.push({
    role: "user",
    parts: [{ text: question }],
  });

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    let reply = null;

    // 1. Primary: Gemini via GEMINI_API_KEY_REPORTCHAT
    if (geminiReportKey) {
      reply = await callGemini(geminiReportKey, systemText, geminiContents, controller.signal);
    }

    // 2. Fallback: Gemini via GEMINI_API_KEY_SOCIAL (if Key 1 is rate-limited)
    if (!reply && geminiSocialKey && geminiSocialKey !== geminiReportKey) {
      console.warn("[ReportChat] Primary Gemini key failed or rate-limited, attempting GEMINI_API_KEY_SOCIAL fallback");
      reply = await callGemini(geminiSocialKey, systemText, geminiContents, controller.signal);
    }

    // 3. Fallback: Groq LPU (if Gemini endpoints are down or exhausted)
    if (!reply && groqKey) {
      console.warn("[ReportChat] Gemini failed, attempting Groq fallback");
      try {
        const groqMessages = [
          { role: "system", content: systemText },
          ...(Array.isArray(history) ? history : []).map((m) => ({
            role: m.role === "assistant" ? "assistant" : "user",
            content: String(m.text || m.content || ""),
          })),
          { role: "user", content: question },
        ];

        const res = await fetch(GROQ_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${groqKey}`,
          },
          body: JSON.stringify({
            model: GROQ_MODEL,
            messages: groqMessages,
            max_tokens: 380,
            temperature: 0.6,
          }),
          signal: controller.signal,
        });

        if (res.ok) {
          const data = await res.json();
          reply = data?.choices?.[0]?.message?.content?.trim();
        }
      } catch (groqErr) {
        console.warn("[ReportChat] Groq fallback error:", groqErr.message);
      }
    }

    if (!reply) {
      throw new Error("No response generated from available AI engines");
    }

    return Response.json({ reply });
  } catch (err) {
    console.error("Report chat error:", err);
    return Response.json({
      reply: "I'm having a little trouble connecting right now. Please try your question again in a moment.",
    });
  } finally {
    clearTimeout(timeoutId);
  }
}
