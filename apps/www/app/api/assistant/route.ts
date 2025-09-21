import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const messageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1),
});

const requestSchema = z.object({
  messages: z.array(messageSchema).min(1),
});

type ConversationMessage = z.infer<typeof messageSchema>;

type Bucket = {
  tokens: number;
  updatedAt: number;
};

const RATE_BUCKETS = new Map<string, Bucket>();
const MAX_TOKENS = 6;
const REFILL_INTERVAL_MS = 60_000;

export async function POST(request: NextRequest) {
  const apiKey = process.env.TRANSFORMAI_ASSISTANT_KEY;
  if (!apiKey) {
    console.error("TRANSFORMAI_ASSISTANT_KEY is not configured");
    return NextResponse.json({ error: "Assistant unavailable" }, { status: 401 });
  }

  const clientId = getClientIdentifier(request);
  if (!consumeToken(clientId)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch (error) {
    console.error("Assistant request payload is not valid JSON", error);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const parseResult = requestSchema.safeParse(payload);
  if (!parseResult.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const { messages } = parseResult.data;

  try {
    const response = await fetch("https://api.transformai.ai/assistant", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ messages }),
      cache: "no-store",
    });

    if (response.ok) {
      const data = (await response.json().catch(() => ({}))) as { message?: string; choices?: Array<{ message?: { content?: string } }>; };
      const modelMessage = getMessageFromResponse(data);
      if (modelMessage) {
        return NextResponse.json({ message: modelMessage });
      }
    } else {
      const errorResponse = await response.json().catch(() => null);
      const reason = typeof errorResponse?.error === "string" ? errorResponse.error : response.statusText;
      console.error("Assistant upstream responded with error", reason);
    }
  } catch (error) {
    console.error("Assistant upstream request failed", error);
  }

  const fallback = buildFallbackMessage(messages);
  return NextResponse.json({ message: fallback });
}

function consumeToken(identifier: string) {
  const now = Date.now();
  const bucket = RATE_BUCKETS.get(identifier) ?? { tokens: MAX_TOKENS, updatedAt: now };
  const elapsed = now - bucket.updatedAt;
  if (elapsed > 0) {
    const refill = Math.floor((elapsed / REFILL_INTERVAL_MS) * MAX_TOKENS);
    if (refill > 0) {
      bucket.tokens = Math.min(MAX_TOKENS, bucket.tokens + refill);
      bucket.updatedAt = now;
    }
  }

  if (bucket.tokens <= 0) {
    RATE_BUCKETS.set(identifier, bucket);
    return false;
  }

  bucket.tokens -= 1;
  bucket.updatedAt = now;
  RATE_BUCKETS.set(identifier, bucket);
  return true;
}

function getClientIdentifier(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const [first] = forwarded.split(",");
    if (first) {
      return first.trim();
    }
  }
  if (request.ip) {
    return request.ip;
  }
  return "anonymous";
}

function getMessageFromResponse(data: {
  message?: string;
  choices?: Array<{ message?: { content?: string } }>;
}) {
  if (data?.message && typeof data.message === "string") {
    return data.message.trim();
  }
  const choice = data?.choices?.[0]?.message?.content;
  if (typeof choice === "string") {
    return choice.trim();
  }
  return "";
}

function buildFallbackMessage(messages: ConversationMessage[]) {
  const lastUserMessage = [...messages].reverse().find((message) => message.role === "user");
  if (!lastUserMessage) {
    return "Thanks for reaching out to TransformAI. We'll reply with tailored guidance shortly.";
  }
  return `Thanks for your question about "${lastUserMessage.content}". A TransformAI strategist will follow up with tailored guidance shortly.`;
}
