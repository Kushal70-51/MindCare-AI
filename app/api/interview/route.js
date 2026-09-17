// Adaptive interview LLM call — powered exclusively by ultra-fast Groq LPU (Qwen 3.8 27B)
// with automatic Google Gemini fallback (and localized offline clinical safeguards).
// Delivers sub-second, empathetic clinical dialogue in English, Hindi, and Marathi.
// OpenRouter has been completely removed.

const GROQ_MODEL = "qwen/qwen3.8-27b";
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

const GEMINI_MODELS = ["gemini-flash-latest", "gemini-2.5-flash"];
const MAX_TURNS = 6;
const REQUEST_TIMEOUT_MS = 4500;
const MAX_TOKENS = 180;

const SYSTEM_PROMPT_CORE = `You are Sage, the voice of the MindCare AI Companion — a warm, empathetic wellbeing check-in guide conducting a short, spoken clinical interview.
Rules:
- Speak like a caring, attentive friend. 1-2 short, spoken sentences (no markdown, no bullets, no emojis).
- First acknowledge the person's answer with genuine empathy, then ask exactly ONE new wellbeing question.
- Do not repeat questions or re-ask their age.
- Screening aid, not diagnosis. Never diagnose or alarm.
- On turn 6 or when wrapping up, give a warm closing line without a question, and set continue_interview to false.
- Return ONLY a JSON object: {"reply": string, "mood_tag": string, "continue_interview": boolean}.
- mood_tag MUST be a 1-3 word English emotional descriptor (e.g. "anxious", "fatigued", "calm", "overwhelmed").`;

const FALLBACKS = {
  en: {
    questions: [
      "How have you been sleeping lately — restful, or more restless than usual?",
      "What's something that has been on your mind a lot this past week?",
      "When things feel stressful or overwhelming, what do you usually do to cope?",
      "How connected do you feel to friends, family, or people around you right now?",
      "On a typical day lately, do you feel more energized or emotionally drained?",
    ],
    closing: "Thank you so much for sharing that with me. That's everything I need for now. Let's look at your report.",
  },
  hi: {
    questions: [
      "हाल ही में आपकी नींद कैसी रही है — क्या आपको आराम मिल रहा है, या बेचैनी रहती है?",
      "इस पिछले हफ्ते ऐसी कौन सी बात है जो आपके मन में सबसे ज्यादा चल रही है?",
      "जब तनाव या चिंता महसूस होती है, तो खुद को शांत करने के लिए आप क्या करते हैं?",
      "आजकल आप अपने दोस्तों या परिवार के साथ कितना जुड़ाव महसूस करते हैं?",
      "आमतौर पर दिनभर में आप कैसा महसूस करते हैं — ऊर्जावान या थका हुआ?",
    ],
    closing: "अपने मन की बात साझा करने के लिए बहुत-बहुत धन्यवाद। अब हम आपकी रिपोर्ट की ओर बढ़ते हैं।",
  },
  mr: {
    questions: [
      "अलीकडच्या काळात तुमची झोप कशी आहे — शांत झोप लागते की अस्वस्थता वाटते?",
      "गेल्या आठवड्यात अशी कोणती गोष्ट आहे जी तुमच्या मनात वारंवार येत आहे?",
      "जेव्हा ताण किंवा अस्वस्थता जाणवते, तेव्हा स्वतःला शांत करण्यासाठी तुम्ही काय करता?",
      "सध्या तुम्ही कुटुंब किंवा मित्रांशी किती जोडलेले आहात असे वाटते?",
      "दिवसभरात साधारणपणे तुम्हाला कसे वाटते — उत्साही की खूप थकलेले?",
    ],
    closing: "तुमच्या भावना मनमोकळेपणाने व्यक्त केल्याबद्दल मनापासून धन्यवाद. आता आपण तुमच्या अहवालाकडे वळूया.",
  },
};

function buildFallbackReply(history, langCode = "en") {
  const assistantTurns = (history || []).filter((m) => m.role === "assistant").length;
  const langKey = langCode.startsWith("hi") ? "hi" : langCode.startsWith("mr") ? "mr" : "en";
  const pack = FALLBACKS[langKey] || FALLBACKS.en;

  if (assistantTurns >= MAX_TURNS) {
    return { reply: pack.closing, mood_tag: "calm", continue_interview: false };
  }
  const question = pack.questions[(assistantTurns - 1 + pack.questions.length) % pack.questions.length];
  return { reply: question, mood_tag: "neutral", continue_interview: true };
}

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

async function callGeminiFallback(geminiKey, systemPrompt, history, signal) {
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
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents,
          generationConfig: {
            responseMimeType: "application/json",
            maxOutputTokens: 250,
            temperature: 0.5,
          },
        }),
        signal,
      });

      if (res.ok) {
        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("");
        if (text) {
          const parsed = parseAndValidate(text);
          return { ...parsed, _provider: `gemini_fallback (${model})` };
        }
      }
    } catch (err) {
      console.warn(`[Gemini Fallback ${model}] error:`, err.message);
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
    return Response.json(buildFallbackReply(history, langCode));
  }

  // Build condensed, targeted system prompt
  let system = SYSTEM_PROMPT_CORE;
  if (name) system += `\nPerson's name: ${name}.`;
  if (faceEmotion) system += `\nCurrent webcam facial expression: ${faceEmotion}.`;

  if (isHindi) {
    system += `\nLANGUAGE REQUIREMENT: Respond EXCLUSIVELY in natural, clean Devanagari Hindi (हिन्दी). Do NOT output English or Roman letters in 'reply'. Keep 'mood_tag' in English.`;
  } else if (isMarathi) {
    system += `\nLANGUAGE REQUIREMENT: Respond EXCLUSIVELY in natural, warm Devanagari Marathi (मराठी). Do NOT output English or Roman letters in 'reply'. Keep 'mood_tag' in English.`;
  } else {
    system += `\nLANGUAGE REQUIREMENT: Respond in clear, empathetic English.`;
  }

  const messages = [
    { role: "system", content: system },
    ...history.map((m) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: String(m.content || ""),
    })),
  ];

  const abortController = new AbortController();
  const timeoutId = setTimeout(() => abortController.abort(), REQUEST_TIMEOUT_MS);

  // 1. Primary Attempt: Groq LPU (Sub-second speed)
  if (groqKey) {
    try {
      const res = await fetch(GROQ_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${groqKey}`,
        },
        body: JSON.stringify({
          model: GROQ_MODEL,
          messages,
          max_tokens: MAX_TOKENS,
          temperature: 0.5,
          response_format: { type: "json_object" },
        }),
        signal: abortController.signal,
      });

      if (res.ok) {
        const data = await res.json();
        const content = data.choices?.[0]?.message?.content;
        const parsed = parseAndValidate(content);
        clearTimeout(timeoutId);
        const latency = Date.now() - tStart;
        console.log(`[MindCare Interview API] Success via Groq in ${latency}ms`);
        return Response.json({
          reply: parsed.reply,
          mood_tag: parsed.mood_tag,
          continue_interview: parsed.continue_interview,
          _latencyMs: latency,
          _provider: "groq",
        });
      } else {
        console.warn(`[MindCare Interview API] Groq HTTP ${res.status}, engaging Gemini fallback`);
      }
    } catch (err) {
      console.warn(`[MindCare Interview API] Groq call failed (${err.message}), engaging Gemini fallback`);
    }
  }

  // 2. Fallback Chain: Gemini API (if Groq fails or rate-limits)
  if (geminiFallbackKey) {
    try {
      const fallbackResult = await callGeminiFallback(
        geminiFallbackKey,
        system,
        history,
        abortController.signal
      );
      clearTimeout(timeoutId);
      const latency = Date.now() - tStart;
      console.log(`[MindCare Interview API] Success via Gemini Fallback in ${latency}ms`);
      return Response.json({
        reply: fallbackResult.reply,
        mood_tag: fallbackResult.mood_tag,
        continue_interview: fallbackResult.continue_interview,
        _latencyMs: latency,
        _provider: fallbackResult._provider,
      });
    } catch (fallbackErr) {
      console.warn(`[MindCare Interview API] Gemini fallback failed:`, fallbackErr.message);
    }
  }

  clearTimeout(timeoutId);
  const latency = Date.now() - tStart;
  console.warn(`[MindCare Interview API] Returning localized clinical safety reply after ${latency}ms`);
  return Response.json({
    ...buildFallbackReply(history, langCode),
    _provider: "clinical_fallback",
    _latencyMs: latency,
  });
}
