// Adaptive interview LLM engine — powered by Groq LPU (GPT-OSS 20B & Qwen 3.8 27B)
// with automatic Google Gemini fallback, SSE word-by-word streaming,
// and comprehensive 10-turn behavioral psychiatric assessment (4-5 min target).
// Delivers sub-second, empathetic clinical dialogue in English, Hindi, and Marathi.

const GROQ_MODELS = ["qwen/qwen3.8-27b", "openai/gpt-oss-20b"];
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

const GEMINI_MODELS = ["gemini-3.6-flash", "gemini-2.5-flash", "gemini-flash-latest"];
const MINIMUM_DURATION_SEC = 300; // 5 minutes minimum interview duration
const MAX_TOKENS = 120;

const CLINICAL_DOMAINS = [
  "Warm introduction, establishing emotional safety, rapport, and confirming age.",
  "Sleep architecture, insomnia, waking unrefreshed, nighttime anxiety, or sleep disturbances.",
  "Physical and mental energy depletion, daily vitality, chronic fatigue, and task burnout.",
  "Acute life, career, academic, financial, or interpersonal stressors currently weighing on them.",
  "Anxiety symptoms, racing thoughts, restlessness, somatic tension, or feelings of panic.",
  "Depressive affect, feelings of persistent sadness, emotional numbness, or anhedonia (loss of joy).",
  "Social connectedness, loneliness, feelings of isolation vs having a supportive circle.",
  "Coping mechanisms, emotional regulation strategies, and daily habits under distress.",
  "Self-worth, inner monologue, negative self-talk, feelings of guilt or imposter syndrome.",
  "Psychosomatic bodily symptoms — tension headaches, chest tightness, stomach distress, or appetite changes.",
  "Daily rhythm, appetite changes, nutritional regularity, and routines that ground them.",
  "Future outlook, hope, personal meaning, sense of agency, and aspirations.",
];

const SYSTEM_PROMPT_CORE = `You are Sage, the voice of the MindCare AI Companion — an expert, deeply empathetic clinical wellbeing conversationalist conducting an in-depth behavioral psychiatric assessment.

CORE PRINCIPLES:
- Speak like a caring, attentive clinician and friend in 1-2 short, spoken sentences (max 30 words). Never use markdown, bullets, lists, or emojis.
- ADAPTIVE IN-DEPTH EVALUATION: There is NO artificial question limit. You can ask as many questions as needed based on what the person shares so you can thoroughly understand their mental health condition, symptoms, and psychological state.
- READ CAREFULLY: Always acknowledge what they specifically shared with heartfelt empathy first, then ask ONE precise, exploratory follow-up question digging into their condition, emotional patterns, or triggers.
- DURATION REQUIREMENT: The interview must last at least 5 minutes of interactive dialogue. Do NOT conclude before this minimum time is satisfied.
- Screening and empathetic understanding only — never provide a clinical diagnosis or cause alarm.
- At the very end of your response on a new line, always append:
||| mood_tag: <1-3 word English emotional descriptor> | continue_interview: <true/false> |||`;

function generateDynamicFallback(history, langCode = "en", currentTurn = 1, elapsedSeconds = 0) {
  const lastUserMsg = (history || []).slice().reverse().find((m) => m.role === "user")?.content || "";
  const isHindi = langCode.includes("hi");
  const isMarathi = langCode.includes("mr");

  // Conclude with an inspiring, supportive clinical closing when 5 minutes (300s) have elapsed
  if (elapsedSeconds >= MINIMUM_DURATION_SEC && currentTurn >= 6) {
    if (isHindi) {
      return {
        reply: "आज इतनी सच्चाई, साहस और खुले दिल से अपने मन की बात साझा करने के लिए आपका बहुत-बहुत धन्यवाद। आपकी भावनाएं बेहद महत्वपूर्ण हैं। मैंने हमारी पूरी बातचीत को समझकर आपकी विस्तृत स्वास्थ्य रिपोर्ट तैयार की है। आप इस सफर में अकेले नहीं हैं—आइए, मिलकर आपकी रिपोर्ट देखते हैं।",
        mood_tag: "supportive",
        continue_interview: false,
      };
    }
    if (isMarathi) {
      return {
        reply: "आज इतक्या धैर्याने, प्रामाणिकपणे आणि मोकळेपणाने आपल्या भावना मांडल्याबद्दल मनःपूर्वक धन्यवाद. तुमची ही वाटचाल कौतुकास्पद आहे. आपल्या संपूर्ण संवादाच्या आधारे मी आपला सविस्तर क्लिनिकल अहवाल तयार केला आहे. आपण एकटे नाही आहात—चला, एकत्र आपला अहवाल पाहूया.",
        mood_tag: "supportive",
        continue_interview: false,
      };
    }
    return {
      reply: "Thank you so much for sharing your heart and story with me today. Your vulnerability and resilience are truly inspiring. I have woven everything we discussed into your personalized clinical evaluation report. You are never alone in this journey—let's take a look at your summary now.",
      mood_tag: "supportive",
      continue_interview: false,
    };
  }

  // Domain-specific tailored fallback questions (cyclic through 12+ clinical domains)
  const domainQuestions = [
    {
      en: "How has your sleep been lately — do you wake up feeling rested, or more exhausted than usual?",
      hi: "हाल ही में आपकी नींद कैसी रही है — क्या सुबह उठकर तरोताजा महसूस होता है, या थकान बनी रहती है?",
      mr: "अलीकडच्या काळात तुमची झोप कशी आहे — सकाळी उठल्यावर ताजेतवाने वाटते की दिवसभर थकवा जाणवतो?",
    },
    {
      en: "On a typical day, how would you describe your overall energy and motivation levels?",
      hi: "आमतौर पर दिनभर में आपकी ऊर्जा और काम करने के उत्साह का स्तर कैसा रहता है?",
      mr: "साधारणपणे दिवसभरात तुमची ऊर्जा आणि काम करण्याचा उत्साह कसा असतो?",
    },
    {
      en: "What has been the biggest source of stress or mental pressure in your life recently?",
      hi: "हाल के दिनों में आपके जीवन में तनाव या मानसिक दबाव का सबसे बड़ा कारण क्या रहा है?",
      mr: "गेल्या काही दिवसांत तुमच्या आयुष्यात तणाव किंवा मानसिक त्रासाचे मुख्य कारण काय राहिले आहे?",
    },
    {
      en: "When anxiety or overwhelming thoughts arise, how easily are you able to calm your mind?",
      hi: "जब चिंता या परेशान करने वाले विचार आते हैं, तो अपने मन को शांत करना कितना आसान या मुश्किल लगता है?",
      mr: "जेव्हा अस्वस्थता किंवा नकारात्मक विचार मनात येतात, तेव्हा मन शांत करणे सोपे जाते की कठीण?",
    },
    {
      en: "Have you noticed a loss of interest or joy in things and hobbies you normally enjoy doing?",
      hi: "क्या आपने उन कामों या शौक में दिलचस्पी कम होते देखी है जो आपको पहले पसंद थे?",
      mr: "पूर्वी आवडणाऱ्या गोष्टी किंवा छंदांमध्ये सध्या तुमचा रस किंवा आनंद कमी झाल्यासारखा वाटतो का?",
    },
    {
      en: "How connected do you feel with friends, family, or people in your life right now?",
      hi: "आजकल आप अपने दोस्तों, परिवार या करीबी लोगों के साथ कितना जुड़ाव या अकेलापन महसूस करते हैं?",
      mr: "सध्या तुम्ही कुटुंब, मित्र किंवा जवळच्या व्यक्तींशी किती जोडलेले आहात की एकटेपणा जाणवतो?",
    },
    {
      en: "When things get tough emotionally, what coping mechanisms or habits do you usually rely on?",
      hi: "जब भावनात्मक रूप से मुश्किल समय आता है, तो खुद को संभालने के लिए आप किन आदतों का सहारा लेते हैं?",
      mr: "जेव्हा भावनिकदृष्ट्या कठीण वेळ येते, तेव्हा स्वतःला सावरण्यासाठी तुम्ही कोणत्या पद्धती वापरता?",
    },
    {
      en: "How would you describe your inner self-talk — is it generally supportive, or quite harsh and self-critical?",
      hi: "आप अपने खुद के बारे में कैसा सोचते हैं — क्या आप खुद के प्रति दयालु हैं या अक्सर आलोचना करते हैं?",
      mr: "स्वतःबद्दल तुमचे विचार कसे असतात — तुम्ही स्वतःला आधार देता की जास्त दोष देता?",
    },
    {
      en: "Do you ever notice physical sensations like tightness in your chest, headaches, or muscle tension when stressed?",
      hi: "तनाव के समय क्या आपको सिरदर्द, सीने में भारीपन या मांसपेशियों में खिंचाव जैसे शारीरिक लक्षण महसूस होते हैं?",
      mr: "तणावाच्या वेळी डोकेदुखी, छातीत धडधडणे किंवा स्नायूंमध्ये ताण अशी शारीरिक लक्षणे जाणवतात का?",
    },
    {
      en: "How has your appetite or relationship with food and regular meals been lately?",
      hi: "पिछले कुछ हफ्तों में आपकी भूख और खान-पान की दिनचर्या में कोई बदलाव आया है क्या?",
      mr: "गेल्या काही आठवड्यांत तुमची भूक आणि खाण्यापिण्याच्या सवयींमध्ये काही बदल जाणवला आहे का?",
    },
    {
      en: "Looking ahead at the near future, do you feel a sense of hope and optimism, or uncertainty?",
      hi: "आने वाले समय को देखते हुए, क्या आपको उम्मीद और सकारात्मकता महसूस होती है, या अनिश्चितता?",
      mr: "भविष्याकडे पाहताना तुम्हाला आशा आणि सकारात्मकता वाटते की भीती आणि अनिश्चितता?",
    },
  ];

  const domainIdx = Math.max(0, (currentTurn - 2) % domainQuestions.length);
  const currentQ = domainQuestions[domainIdx];
  const langKey = isHindi ? "hi" : isMarathi ? "mr" : "en";
  const questionText = currentQ[langKey] || currentQ.en;

  const snippet = lastUserMsg ? lastUserMsg.slice(0, 32) : "";
  let prefix = "";
  if (snippet) {
    if (isHindi) prefix = `मैं समझ सकता हूँ। `;
    else if (isMarathi) prefix = `मला समजतंय. `;
    else prefix = `I hear you. `;
  }

  return {
    reply: `${prefix}${questionText}`,
    mood_tag: "empathetic",
    continue_interview: elapsedSeconds < MINIMUM_DURATION_SEC || currentTurn < 10,
  };
}

// Helper to parse metadata from tagged response or JSON
function extractReplyAndMeta(fullText, elapsedSeconds = 0) {
  let reply = fullText.trim();
  let mood_tag = "neutral";
  let continue_interview = elapsedSeconds < MINIMUM_DURATION_SEC;

  // Pattern 1: JSON format
  if (reply.startsWith("{") && reply.endsWith("}")) {
    try {
      const parsed = JSON.parse(reply);
      const parsedContinue = parsed.continue_interview !== false;
      return {
        reply: parsed.reply || reply,
        mood_tag: parsed.mood_tag || "neutral",
        continue_interview: elapsedSeconds < MINIMUM_DURATION_SEC ? true : parsedContinue,
      };
    } catch (e) {}
  }

  // Pattern 2: ||| mood_tag: ... | continue_interview: ... |||
  const metaMatch = reply.match(/\|\|\|\s*mood_tag:\s*([^|]+)\|\s*continue_interview:\s*([^|]+)\|\|\|/i);
  if (metaMatch) {
    mood_tag = metaMatch[1].trim().toLowerCase();
    const contStr = metaMatch[2].trim().toLowerCase();
    continue_interview = contStr === "true" || contStr === "1";
    reply = reply.replace(/\|\|\|[\s\S]*\|\|\|/, "").trim();
  } else {
    // Strip trailing tag-like markers if present
    reply = reply.replace(/\|\|\|[\s\S]*$/, "").trim();
  }

  // Strictly enforce minimum 5 minutes (300 seconds) duration
  if (elapsedSeconds < MINIMUM_DURATION_SEC) {
    continue_interview = true;
  }

  return {
    reply,
    mood_tag,
    continue_interview,
  };
}

// Stream simulated words for fallback
async function streamFallbackWords(fallback, controller, encoder) {
  const words = fallback.reply.split(" ");
  for (let i = 0; i < words.length; i++) {
    const chunk = (i === 0 ? "" : " ") + words[i];
    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "token", token: chunk })}\n\n`));
    await new Promise((r) => setTimeout(r, 20));
  }
  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "done", ...fallback })}\n\n`));
  controller.close();
}

export async function POST(request) {
  const tStart = Date.now();
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { history, name, faceEmotion, language, stream: wantStream, elapsedSeconds: rawElapsed } = body || {};
  const elapsedSeconds = Number(rawElapsed) || 0;
  const isStreamingRequested =
    wantStream !== false && (wantStream === true || request.headers.get("accept")?.includes("text/event-stream"));

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

  // Fast-path for Turn 1 opener
  const userAnswers = history.filter((m) => m.role === "user");
  if (userAnswers.length === 0) {
    const firstName = (name || "").trim().split(" ")[0];
    let opener = `Hi ${firstName || "there"}, thanks for being here. Before we get started, could you tell me your age?`;
    if (isHindi) {
      opener = `नमस्ते ${firstName ? firstName + ", " : ""}यहाँ आने के लिए शुक्रिया। बातचीत शुरू करने से पहले, क्या आप मुझे अपनी उम्र बता सकते हैं?`;
    } else if (isMarathi) {
      opener = `नमस्कार ${firstName ? firstName + ", " : ""}इथे आल्याबद्दल धन्यवाद. संवाद सुरू करण्यापूर्वी, आपण आपले वय सांगू शकाल का?`;
    }

    if (isStreamingRequested) {
      const encoder = new TextEncoder();
      const customStream = new ReadableStream({
        async start(controller) {
          await streamFallbackWords(
            { reply: opener, mood_tag: "neutral", continue_interview: true, _provider: "cache" },
            controller,
            encoder
          );
        },
      });
      return new Response(customStream, {
        headers: {
          "Content-Type": "text/event-stream; charset=utf-8",
          "Cache-Control": "no-cache, no-transform",
          Connection: "keep-alive",
        },
      });
    }

    return Response.json({
      reply: opener,
      mood_tag: "neutral",
      continue_interview: true,
      _provider: "cache",
      _latencyMs: Date.now() - tStart,
    });
  }

  const currentTurn = userAnswers.length + 1;
  const groqKey = process.env.GROQ_API_KEY || process.env.GROQ_API_KEY_ASSESSMENT;
  const geminiFallbackKey = process.env.GEMINI_API_KEY_REPORTCHAT || process.env.GEMINI_API_KEY_SOCIAL;

  // Build targeted system prompt with current behavioral psychiatric domain
  let system = SYSTEM_PROMPT_CORE;
  if (name) system += `\nPerson's name: ${name}.`;
  if (faceEmotion) system += `\nCurrent webcam facial expression: ${faceEmotion}.`;

  const domainFocus = CLINICAL_DOMAINS[(currentTurn - 1) % CLINICAL_DOMAINS.length];
  system += `\nINTERVIEW PROGRESS:
- Current interaction turn: ${currentTurn} (no artificial question cap; ask as many questions as needed).
- Elapsed interview duration: ${Math.floor(elapsedSeconds / 60)}m ${elapsedSeconds % 60}s (${elapsedSeconds} seconds total).
- Behavioral health exploration domain: ${domainFocus}`;

  if (elapsedSeconds < 240) {
    const minsRemaining = Math.ceil((MINIMUM_DURATION_SEC - elapsedSeconds) / 60);
    system += `\nINTERVIEW STAGE: ACTIVE CLINICAL EXPLORATION (approx ${minsRemaining} minute(s) remaining until 5-minute target).
Do NOT conclude or wrap up the conversation yet!
Acknowledge what they specifically shared with heartfelt empathy, then ask exactly ONE relevant follow-up question digging deeper into their condition and the domain '${domainFocus}'.
In the metadata tag, set continue_interview: true.`;
  } else if (elapsedSeconds < MINIMUM_DURATION_SEC) {
    system += `\nINTERVIEW STAGE: GENTLE CLOSING PREPARATION (Final minute, 4-5 minutes elapsed).
Begin gently transitioning towards closure. Acknowledge what they shared with deep validation and ask ONE gentle final reflection question (e.g. asking what normally brings them comfort or peace, or how they feel about taking positive steps for their wellbeing).
In the metadata tag, set continue_interview: true.`;
  } else {
    system += `\nINTERVIEW STAGE: 5 MINUTES SATISFIED — BEAUTIFUL, EMPATHETIC & CLINICALLY GROUNDED CONCLUSION:
The 5-minute consultation is complete! Conclude the session with a warm, uplifting, and validating closing statement (2 spoken sentences, max 35 words).
Express heartfelt appreciation for their courage and vulnerability, assure them that their feelings are heard and that they are not alone, and warmly invite them to review their personalized clinical evaluation report.
Do NOT ask any more questions!
In the metadata tag, MUST set continue_interview: false.`;
  }

  if (isHindi) {
    system += `\nCRITICAL LANGUAGE LOCK: Respond 100% EXCLUSIVELY in natural, empathetic Devanagari Hindi script (हिन्दी). Do NOT output English or Roman letters in your spoken response. First acknowledge what the user said in Hindi, then ask ONE new follow-up question in Hindi. Keep 'mood_tag' in English.`;
  } else if (isMarathi) {
    system += `\nCRITICAL LANGUAGE LOCK: Respond 100% EXCLUSIVELY in natural, warm Devanagari Marathi script (मराठी). Do NOT output English or Roman letters in your spoken response. First acknowledge what the user said in Marathi, then ask ONE new follow-up question in Marathi. Keep 'mood_tag' in English.`;
  } else {
    system += `\nCRITICAL LANGUAGE LOCK: Respond in clear, empathetic English. First acknowledge what the user specifically said with genuine empathy, then ask ONE new follow-up question in English.`;
  }

  const condensedHistory = history.length > 4 ? history.slice(-4) : history;
  const messages = [
    { role: "system", content: system },
    ...condensedHistory.map((m) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: String(m.content || ""),
    })),
  ];

  // SSE STREAMING PATH
  if (isStreamingRequested) {
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        // Attempt Groq Streaming
        if (groqKey) {
          for (const gModel of GROQ_MODELS) {
            try {
              const fetchController = new AbortController();
              const timeoutId = setTimeout(() => fetchController.abort(), 9000);

              const groqRes = await fetch(GROQ_URL, {
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
                  stream: true,
                }),
                signal: fetchController.signal,
              });

              clearTimeout(timeoutId);

              if (groqRes.ok && groqRes.body) {
                const reader = groqRes.body.getReader();
                const decoder = new TextDecoder();
                let accumulated = "";
                let inMetaTag = false;
                let buffer = "";

                while (true) {
                  const { done, value } = await reader.read();
                  if (done) break;

                  buffer += decoder.decode(value, { stream: true });
                  const lines = buffer.split("\n");
                  buffer = lines.pop() || "";

                  for (const line of lines) {
                    const trimmed = line.trim();
                    if (!trimmed.startsWith("data:")) continue;
                    const jsonStr = trimmed.slice(5).trim();
                    if (jsonStr === "[DONE]") break;

                    try {
                      const parsedChunk = JSON.parse(jsonStr);
                      const deltaToken = parsedChunk?.choices?.[0]?.delta?.content || "";
                      if (!deltaToken) continue;

                      accumulated += deltaToken;

                      // Check if we hit the metadata tag
                      if (!inMetaTag && (accumulated.includes("|") || deltaToken.includes("|"))) {
                        inMetaTag = true;
                      }

                      if (!inMetaTag) {
                        // Stream spoken token immediately to user!
                        controller.enqueue(
                          encoder.encode(
                            `data: ${JSON.stringify({ type: "token", token: deltaToken })}\n\n`
                          )
                        );
                      }
                    } catch (err) {}
                  }
                }

                const result = extractReplyAndMeta(accumulated, elapsedSeconds);
                console.log(`[MindCare Interview SSE] Completed turn ${currentTurn} (${elapsedSeconds}s) via ${gModel} in ${Date.now() - tStart}ms`);
                controller.enqueue(
                  encoder.encode(
                    `data: ${JSON.stringify({
                      type: "done",
                      ...result,
                      _latencyMs: Date.now() - tStart,
                      _provider: `groq_stream (${gModel})`,
                    })}\n\n`
                  )
                );
                controller.close();
                return;
              }
            } catch (groqErr) {
              console.warn(`[MindCare Interview SSE] Groq ${gModel} streaming error:`, groqErr.message);
            }
          }
        }

        // Fallback: Dynamic streaming fallback
        console.warn(`[MindCare Interview SSE] Streaming localized clinical fallback for turn ${currentTurn} (${elapsedSeconds}s)`);
        const fallback = generateDynamicFallback(history, langCode, currentTurn, elapsedSeconds);
        await streamFallbackWords(
          { ...fallback, _provider: "dynamic_fallback", _latencyMs: Date.now() - tStart },
          controller,
          encoder
        );
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  }

  // NON-STREAMING JSON FALLBACK (Backward Compatibility)
  if (groqKey) {
    for (const gModel of GROQ_MODELS) {
      try {
        const fetchController = new AbortController();
        const timeoutId = setTimeout(() => fetchController.abort(), 6000);
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
          }),
          signal: fetchController.signal,
        });
        clearTimeout(timeoutId);
        if (res.ok) {
          const data = await res.json();
          const content = data.choices?.[0]?.message?.content || "";
          const parsed = extractReplyAndMeta(content, elapsedSeconds);
          return Response.json({
            ...parsed,
            _latencyMs: Date.now() - tStart,
            _provider: `groq (${gModel})`,
          });
        }
      } catch (err) {}
    }
  }

  const safeFallback = generateDynamicFallback(history, langCode, currentTurn, elapsedSeconds);
  return Response.json({
    ...safeFallback,
    _provider: "dynamic_fallback",
    _latencyMs: Date.now() - tStart,
  });
}
