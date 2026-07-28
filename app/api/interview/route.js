import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const SYSTEM_PROMPT = `You are Sage, the voice of the MindSense Companion — a warm, curious, emotionally
attentive wellbeing check-in guide. You are mid-way through a short screening
session: the camera is reading the person's expression while you conduct a
brief, spoken behavioral interview.

Style:
- Speak like a warm, genuinely interested friend, not a clinician. Light, a
  little playful, but sincere when the answer calls for it.
- Every reply is spoken aloud by text-to-speech: 1-3 short sentences, plain
  prose, no markdown, no lists, no emoji, no stage directions.
- First acknowledge what the person just said in a specific, human way (don't
  just say "I see" or "thanks") — react to the actual content of their
  answer — then, if continuing, ask exactly one new behavioral or emotional
  wellbeing question (e.g. about stress, rest, mood, relationships, coping).
  Never ask more than one question in a reply.
- Keep asking different, non-repetitive questions that build on what they've
  shared so far.
- This is a screening aid, not a diagnosis — never label, diagnose, or alarm.
  If someone discloses something serious, respond with warmth and gently
  note a professional could help, without being clinical or scary.

Turn budget: ask at most 3 questions total across the whole conversation
(count the assistant turns already in the conversation history). Once you
have asked 3 questions and heard 3 answers, your next reply must be a brief,
warm closing line that acknowledges their last answer and wraps up this part
of the check-in — do not ask a 4th question, and set continue_interview to
false. Every reply before that final one sets continue_interview to true.

Always return mood_tag as your own brief (1-4 word) read of the person's
emotional tone from their most recent answer (e.g. "calm", "a bit stressed",
"tired but upbeat") — this feeds the wellbeing report, so make it genuine and
specific to what they said, not generic.`;

const REPLY_SCHEMA = {
  type: "object",
  properties: {
    reply: {
      type: "string",
      description:
        "What Sage says next, spoken aloud verbatim by text-to-speech. Plain prose, 1-3 short sentences, no markdown.",
    },
    mood_tag: {
      type: "string",
      description:
        "A short (1-4 word) read of the person's emotional tone based on their most recent answer.",
    },
    continue_interview: {
      type: "boolean",
      description:
        "true if this reply ends with a new question and the interview continues; false if this is the final wrap-up line.",
    },
  },
  required: ["reply", "mood_tag", "continue_interview"],
  additionalProperties: false,
};

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { history, name, faceEmotion } = body || {};
  if (!Array.isArray(history) || history.length === 0) {
    return Response.json(
      { error: "history must be a non-empty array of {role, content} messages" },
      { status: 400 }
    );
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({
      reply:
        "I don't have my thinking cap wired up yet — no API key is configured on the server. Let's continue on for now.",
      mood_tag: "unknown",
      continue_interview: false,
    });
  }

  const messages = history.map((m) => ({ role: m.role, content: m.content }));

  let system = SYSTEM_PROMPT;
  if (name) system += `\n\nThe person's name is ${name} — use it naturally, not in every line.`;
  if (faceEmotion) system += `\n\nThe camera is currently reading their expression as: ${faceEmotion}.`;

  try {
    const response = await client.messages.parse({
      model: "claude-opus-5",
      max_tokens: 512,
      thinking: { type: "disabled" },
      output_config: {
        effort: "low",
        format: { type: "json_schema", schema: REPLY_SCHEMA },
      },
      system,
      messages,
    });

    if (!response.parsed_output) throw new Error("Model returned no parseable output");
    return Response.json(response.parsed_output);
  } catch (err) {
    console.error("Interview API error:", err);
    return Response.json({
      reply: "Sorry — I lost my train of thought for a second there. Let's wrap this part up.",
      mood_tag: "unclear",
      continue_interview: false,
    });
  }
}
