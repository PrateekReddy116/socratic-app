import { ChatSession, GoogleGenerativeAI, Part } from '@google/generative-ai';

const SOCRATIC_SYSTEM_PROMPT = `You are Socratic — a brilliantly patient tutor and a brilliant friend who genuinely enjoys helping people think.

Your ONE rule: Never give the answer or the solution directly. Ever.

Instead, your job is to find the ONE thing — a question, an analogy, a tiny nudge — that makes the user go "oh wait... I think I see it now." That moment of clarity they reach themselves. That's your only goal.

How you behave:
- Ask the one question that exposes the gap in their thinking
- Give a one-line analogy if that unlocks it faster
- Point at the exact step or concept they're glossing over
- If they're overwhelmed, shrink the problem: "forget everything else, just tell me: what do you think X does?"
- If they're close, tell them they're close and nudge the last inch
- Never bullet-point a full explanation. Never walk through a complete solution.
- Never say "Great question!" or any filler affirmation.
- Be warm. Be direct. Sound like a person, not a product.
- Max 3-4 sentences per response. Brevity is the whole point.
- If the user says "just tell me" or gets frustrated — acknowledge the frustration warmly, then still don't give the answer. Redirect: "I know it's frustrating, what's the last thing that made sense before this broke?"

When a screenshot of the user's screen is attached, use it only as background context for their question. Reference visible content only when it helps your nudge — never describe the whole screen.`;

const DEFAULT_GEMINI_MODEL = 'gemini-1.5-flash';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

let geminiConfig: { apiKey: string; model: string } | null = null;
let chatSession: ChatSession | null = null;

function parseBase64Image(imageBase64: string): { mimeType: string; data: string } {
  const match = imageBase64.match(/^data:(image\/\w+);base64,(.+)$/);
  if (match) {
    return { mimeType: match[1], data: match[2] };
  }
  return { mimeType: 'image/png', data: imageBase64.replace(/^data:image\/\w+;base64,/, '') };
}

function buildMessagePayload(message: string, imageBase64?: string | null): string | Part[] {
  if (!imageBase64) return message;

  const { mimeType, data } = parseBase64Image(imageBase64);
  return [
    { text: message },
    { inlineData: { mimeType, data } },
  ];
}

async function ensureGeminiConfig(): Promise<{ apiKey: string; model: string }> {
  if (geminiConfig) return geminiConfig;
  const keys = await window.electronAPI.getApiKeys();
  if (!keys.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured. Add it to your .env file.');
  }
  geminiConfig = {
    apiKey: keys.GEMINI_API_KEY,
    model: keys.GEMINI_MODEL || DEFAULT_GEMINI_MODEL,
  };
  return geminiConfig;
}

async function getOrCreateSession(): Promise<ChatSession> {
  if (chatSession) return chatSession;

  const { apiKey, model } = await ensureGeminiConfig();
  const genAI = new GoogleGenerativeAI(apiKey);
  const generativeModel = genAI.getGenerativeModel({ model });

  chatSession = generativeModel.startChat({
    history: [
      {
        role: 'user',
        parts: [{ text: `System instructions:\n${SOCRATIC_SYSTEM_PROMPT}` }],
      },
      {
        role: 'model',
        parts: [{ text: 'Understood. I will only nudge with questions — never direct answers.' }],
      },
    ],
  });

  return chatSession;
}

export async function askSocratic(
  userMessage: string,
  imageBase64?: string | null,
): Promise<string> {
  const session = await getOrCreateSession();
  const payload = buildMessagePayload(userMessage, imageBase64);
  const result = await session.sendMessage(payload);
  return result.response.text();
}
