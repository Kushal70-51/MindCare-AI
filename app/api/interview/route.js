// Adaptive interview LLM engine — powered by Groq LPU (GPT-OSS 20B & Qwen 3.8 27B)
// with automatic Google Gemini fallback and localized dynamic safeguards.
// Delivers sub-second, empathetic clinical dialogue in English, Hindi, and Marathi.

const GROQ_MODELS = ["openai/gpt-oss-20b", "qwen/qwen3.8-27b"];
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

const GEMINI_MODELS = ["gemini-3.6-flash", "gemini-2.5-flash", "gemini-flash-latest"];
const MAX_TURNS = 6;
const MAX_TOKENS = 450;

const SYSTEM_PROMPT_CORE = `You are Sage, the voice of the MindCare AI Companion — a warm, empathetic wellbeing check-in guide conducting a real, spoken clinical interview.
Rules:

- Speak like a caring, attentive friend in 1-2 short spoken sentences (no markdown, no bullets, no emojis).
- CRITICAL: Read the person's previous response carefully. First acknowledge what they specifically shared with genuine empathy, then ask exactly ONE relevant follow-up question based directly on their answer.
- Do not repeat questions or re-ask their age.
- Screening aid, not diagnosis. Never diagnose or alarm.
- Return ONLY a JSON object: {"reply": string, "mood_tag": string, "continue_interview": boolean}.
- mood_tag MUST be a 1-3 word English emotional descriptor (e.g. "anxious", "fatigued", "calm", "overwhelmed").`;

function parseAndValidate(rawText) {
  if (!rawText || typeof rawText !== "string") throw new Error("Empty model response");
  let cleaned = rawText.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.replace(/^```json/, "").replace(/```$/, "").trim();
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```/, "").replace(/```$/, "").trim();
  }
  const parsed = JSON.parse(cleaned);
  if (typeof parsed.reply !== "string" || !parsed.reply.trim()) {
    throw new Error("Missing reply field in JSON");
  }
  return {
    reply: parsed.reply.trim(),
    mood_tag: typeof parsed.mood_tag === "string" ? parsed.mood_tag.trim() : "neutral",
    continue_interview: parsed.continue_interview !== false,
  };
}

function generateDynamicFallback(history, langCode = "en") {
  const lastUserMsg = (history || []).slice().reverse().find((m) => m.role === "user")?.content || "";
  const assistantTurns = (history || []).filter((m) => m.role === "assistant").length;

  const isHindi = langCode.includes("hi");
  const isMarathi = langCode.includes("mr");

  if (assistantTurns >= MAX_TURNS) {
    if (isHindi)
      return {
        reply: "अपने मन की बात साझा करने के लिए बहुत-बहुत धन्यवाद। अब हम आपकी रिपोर्ट की ओर बढ़ते हैं।",
        mood_tag: "calm",
        continue_interview: false,
      };
    if (isMarathi)
      return {
        reply: "तुमच्या भावना मनमोकळेपणाने व्यक्त केल्याबद्दल मनापासून धन्यवाद. आता आपण तुमच्या अहवालाकडे वळूया.",
        mood_tag: "calm",
        continue_interview: false,
      };
    return {
      reply: "Thank you so much for sharing that with me. Let's look at your report.",
      mood_tag: "calm",
      continue_interview: false,
    };
  }

  // Dynamic, context-aware fallback response based on user's exact prior words
  if (isHindi) {
    const snippet = lastUserMsg ? lastUserMsg.slice(0, 35) : "आपकी बात";
    const reply = lastUserMsg
      ? `मैं आपकी बात समझ पा रहा हूँ कि '${snippet}' आपके मन को प्रभावित कर रहा है। इसके बारे में आपको कैसा महसूस होता है?`
      : "आप इस समय कैसा महसूस कर रहे हैं?";
    return { reply, mood_tag: "empathetic", continue_interview: true };
  }

  if (isMarathi) {
    const snippet = lastUserMsg ? lastUserMsg.slice(0, 35) : "तुमची गोष्ट";
    const reply = lastUserMsg
      ? `मला समजतंय की '${snippet}' मुळे तुम्हाला अस्वस्थ वाटत आहे. याबद्दल अधिक सांगू शकाल का?`
      : "तुम्हाला सध्या कसे वाटत आहे?";
    return { reply, mood_tag: "empathetic", continue_interview: true };
  }

  const snippet = lastUserMsg ? lastUserMsg.slice(0, 35) : "what you shared";
  const reply = lastUserMsg
    ? `I hear you sharing that '${snippet}' is weighing on you. How has this been affecting your daily peace of mind?`
    : "How have you been feeling overall lately?";
  return { reply, mood_tag: "empathetic", continue_interview: true };
}

async function callGroqWithRetry(gModel, messages, groqKey, tStart) {
  for (let attempt = 0; attempt < 2; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5500);
    try {
      const res = await fetch(GROQ_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${groqKey}`,
        },
        body: JSON.stringify({
          model: gModel,
          messages,
          max_tokens: MAX_TOKENS,
          temperature: 0.5,
          response_format: { type: "json_object" },
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      if (res.ok) {
        const data = await res.json();
        const content = data.choices?.[0]?.message?.content;
        return parseAndValidate(content);
      }

      if (res.status === 429 && attempt === 0) {
        console.warn(`[MindCare Interview API] Groq 429 rate limit on ${gModel}, backing off 700ms...`);
        await new Promise((r) => setTimeout(r, 700));
        continue;
      }

      console.warn(`[MindCare Interview API] Groq model ${gModel} returned HTTP ${res.status}`);
      break;
    } catch (err) {
      clearTimeout(timeoutId);
      console.warn(`[MindCare Interview API] Groq model ${gModel} attempt ${attempt} notice:`, err.message);
      if (attempt === 0) await new Promise((r) => setTimeout(r, 300));
    }
  }
  return null;
}

async function callGeminiFallback(geminiKey, systemPrompt, history) {
  const contents = [
    {
      role: "user",
      parts: [
        {
          text: `${systemPrompt}\n\nConversation history so far:\n${JSON.stringify(history)}\n\nGenerate the next single response strictly as JSON with keys 'reply', 'mood_tag', and 'continue_interview'.`,
        },
      ],
    },
  ];

  for (const model of GEMINI_MODELS) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents,
          generationConfig: {
            responseMimeType: "application/json",
            maxOutputTokens: 500,
            temperature: 0.5,
          },
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      if (res.ok) {
        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("");
        if (text) {
          const parsed = parseAndValidate(text);
          return { ...parsed, _provider: `gemini_fallback (${model})` };
        }
      } else {
        console.warn(`[Gemini Fallback ${model}] returned HTTP ${res.status}`);
      }
    } catch (err) {
      clearTimeout(timeoutId);
      console.warn(`[Gemini Fallback ${model}] notice:`, err.message);
    }
  }

  throw new Error("Gemini fallback failed across all candidate models");
}

export async function POST(request) {
  const tStart = Date.now();
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { history, name, faceEmotion, language } = body || {};
  if (!Array.isArray(history) || history.length === 0) {
    return Response.json(
      { error: "history must be a non-empty array of {role, content} messages" },
      { status: 400 }
    );
  }

  const langStr = String(language || "en-IN").toLowerCase();
  const isHindi = langStr.includes("hi") || langStr.includes("hindi");
  const isMarathi = langStr.includes("mr") || langStr.includes("marathi");
  const langCode = isHindi ? "hi-IN" : isMarathi ? "mr-IN" : "en-IN";

  // Fast-path for Turn 1 opener caching if called before user response
  const userAnswers = history.filter((m) => m.role === "user");
  if (userAnswers.length === 0) {
    const firstName = (name || "").trim().split(" ")[0];
    let opener = `Hi ${firstName || "there"}, thanks for being here. Before we get started, could you tell me your age?`;
    if (isHindi) {
      opener = `नमस्ते ${firstName ? firstName + ", " : ""}यहाँ आने के लिए शुक्रिया। बातचीत शुरू करने से पहले, क्या आप मुझे अपनी उम्र बता सकते हैं?`;
    } else if (isMarathi) {
      opener = `नमस्कार ${firstName ? firstName + ", " : ""}इथे आल्याबद्दल धन्यवाद. संवाद सुरू करण्यापूर्वी, आपण आपले वय सांगू शकाल का?`;
    }
    return Response.json({
      reply: opener,
      mood_tag: "neutral",
      continue_interview: true,
      _provider: "cache",
      _latencyMs: Date.now() - tStart,
    });
  }

  // Priority Keys: Primary Groq, secondary Gemini fallback
  const groqKey = process.env.GROQ_API_KEY || process.env.GROQ_API_KEY_ASSESSMENT;
  const geminiFallbackKey = process.env.GEMINI_API_KEY_REPORTCHAT || process.env.GEMINI_API_KEY_SOCIAL;

  if (!groqKey && !geminiFallbackKey) {
    return Response.json(generateDynamicFallback(history, langCode));
  }

  // Keep token footprint slim by using the most recent 4 messages for follow-up context
  const condensedHistory = history.length > 4 ? history.slice(-4) : history;
  const currentTurn = userAnswers.length + 1;

  // Build condensed, targeted system prompt with strict language lock & turn awareness
  let system = SYSTEM_PROMPT_CORE;
  if (name) system += `\nPerson's name: ${name}.`;
  if (faceEmotion) system += `\nCurrent webcam facial expression: ${faceEmotion}.`;

  if (currentTurn >= MAX_TURNS) {
    system += `\nTHIS IS TURN ${currentTurn} OF ${MAX_TURNS} (FINAL WRAP-UP TURN). Give a short warm closing in 1 concise sentence (max 25 words). Do NOT ask any follow-up question, and set continue_interview to false.`;
  } else {
    system += `\nTHIS IS TURN ${currentTurn} OF ${MAX_TURNS}. First acknowledge what they specifically shared with genuine empathy, then ask exactly ONE relevant follow-up question based directly on their answer. Set continue_interview to true.`;
  }

  if (isHindi) {
    system += `\nCRITICAL LANGUAGE LOCK: Respond 100% EXCLUSIVELY in natural, empathetic Devanagari Hindi script (हिन्दी). Do NOT output English or Roman letters in 'reply'. First acknowledge what the user said in Hindi, then ask ONE new follow-up question in Hindi. Keep 'mood_tag' in English.`;
  } else if (isMarathi) {
    system += `\nCRITICAL LANGUAGE LOCK: Respond 100% EXCLUSIVELY in natural, warm Devanagari Marathi script (मराठी). Do NOT output English or Roman letters in 'reply'. First acknowledge what the user said in Marathi, then ask ONE new follow-up question in Marathi. Keep 'mood_tag' in English.`;
  } else {
    system += `\nCRITICAL LANGUAGE LOCK: Respond in clear, empathetic English. First acknowledge what the user specifically said with genuine empathy, then ask ONE new follow-up question in English based directly on their response.`;
  }

  const messages = [
    { role: "system", content: system },
    ...condensedHistory.map((m) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: String(m.content || ""),
    })),
  ];

  // 1. Primary Attempt: Groq LPU with independent per-model timeouts and backoff retry
  if (groqKey) {
    for (const gModel of GROQ_MODELS) {
      const parsed = await callGroqWithRetry(gModel, messages, groqKey, tStart);
      if (parsed) {
        const latency = Date.now() - tStart;
        console.log(
          `[MindCare Interview API] Success via Groq (${gModel}) on turn ${currentTurn} in ${latency}ms:`,
          parsed.reply
        );
        return Response.json({
          reply: parsed.reply,
          mood_tag: parsed.mood_tag,
          continue_interview: currentTurn >= MAX_TURNS ? false : parsed.continue_interview,
          _latencyMs: latency,
          _provider: `groq (${gModel})`,
        });
      }
    }
  }

  // 2. Fallback Chain: Gemini API with fresh per-request controller
  if (geminiFallbackKey) {
    try {
      const fallbackResult = await callGeminiFallback(geminiFallbackKey, system, condensedHistory);
      const latency = Date.now() - tStart;
      console.log(
        `[MindCare Interview API] Success via Gemini Fallback on turn ${currentTurn} in ${latency}ms:`,
        fallbackResult.reply
      );
      return Response.json({
        reply: fallbackResult.reply,
        mood_tag: fallbackResult.mood_tag,
        continue_interview: currentTurn >= MAX_TURNS ? false : fallbackResult.continue_interview,
        _latencyMs: latency,
        _provider: fallbackResult._provider,
      });
    } catch (fallbackErr) {
      console.warn(`[MindCare Interview API] Gemini fallback notice:`, fallbackErr.message);
    }
  }

  const latency = Date.now() - tStart;
  console.warn(`[MindCare Interview API] Returning localized dynamic safety reply after ${latency}ms`);
  const safeFallback = generateDynamicFallback(history, langCode);
  if (currentTurn >= MAX_TURNS) safeFallback.continue_interview = false;
  return Response.json({
    ...safeFallback,
    _provider: "dynamic_fallback",
    _latencyMs: latency,
  });
}
