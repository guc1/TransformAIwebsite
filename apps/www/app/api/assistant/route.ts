import { NextRequest } from "next/server";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 8;

const tokenBuckets = new Map<string, { tokens: number; updatedAt: number }>();

export async function POST(request: NextRequest) {
  if (!process.env.TRANSFORMAI_ASSISTANT_KEY) {
    console.error("[assistant] Missing TRANSFORMAI_ASSISTANT_KEY environment variable.");
    return jsonResponse({ error: "unauthorized" }, 401);
  }

  const identifier = getClientIdentifier(request);

  if (!takeToken(identifier)) {
    return jsonResponse({ error: "rate_limited" }, 429);
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: "invalid_request" }, 400);
  }

  const messages = Array.isArray((body as { messages?: unknown }).messages)
    ? ((body as { messages: ChatMessage[] }).messages ?? [])
    : [];

  const sanitizedMessages = messages
    .filter((message): message is ChatMessage => {
      return Boolean(message) && typeof message.content === "string";
    })
    .map((message) => ({
      role: message.role === "assistant" ? "assistant" : "user",
      content: message.content.slice(0, 4000),
    }));

  const lastUserMessage = [...sanitizedMessages]
    .reverse()
    .find((message) => message.role === "user");

  const reply = buildReply(lastUserMessage?.content);

  return jsonResponse({ message: reply }, 200);
}

function jsonResponse(payload: unknown, status: number) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store",
    },
  });
}

function getClientIdentifier(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",").at(0)?.trim() ?? "anonymous";
  }

  if (request.ip) {
    return request.ip;
  }

  return "anonymous";
}

function takeToken(identifier: string) {
  const now = Date.now();
  const bucket = tokenBuckets.get(identifier);

  if (!bucket) {
    tokenBuckets.set(identifier, {
      tokens: RATE_LIMIT_MAX_REQUESTS - 1,
      updatedAt: now,
    });
    return true;
  }

  const elapsed = now - bucket.updatedAt;
  const tokensToAdd = (elapsed / RATE_LIMIT_WINDOW_MS) * RATE_LIMIT_MAX_REQUESTS;
  const refreshedTokens = Math.min(RATE_LIMIT_MAX_REQUESTS, bucket.tokens + tokensToAdd);

  if (refreshedTokens < 1) {
    bucket.tokens = refreshedTokens;
    bucket.updatedAt = now;
    tokenBuckets.set(identifier, bucket);
    return false;
  }

  bucket.tokens = refreshedTokens - 1;
  bucket.updatedAt = now;
  tokenBuckets.set(identifier, bucket);
  return true;
}

function buildReply(input?: string) {
  const normalized = input?.toLowerCase() ?? "";
  const response: string[] = [];

  response.push("Thanks for reaching out to TransformAI! Here's how we can help next:");

  if (normalized.includes("price") || normalized.includes("cost") || normalized.includes("prijs")) {
    response.push(
      "- **Transparent pricing:** Our introduction package is €5,000 (one-time) and the education program starts at €6,000. Enterprise solutions are tailored with a dedicated proposal.",
    );
  }

  if (normalized.includes("call") || normalized.includes("meeting") || normalized.includes("intro")) {
    response.push(
      "- **Book an intro call:** Share a couple of time slots or request one via hello@transformai.nl — we usually reply within one business day.",
    );
  }

  if (
    normalized.includes("compliance") ||
    normalized.includes("governance") ||
    normalized.includes("regulated") ||
    normalized.includes("risk")
  ) {
    response.push(
      "- **Governance & compliance:** We embed legal, security, and change-management checkpoints so AI can launch safely in regulated environments.",
    );
  }

  response.push(
    "- **What you receive:** We map high-impact workflows, coach your teams on responsible AI adoption, and build the first automations together.",
  );
  response.push(
    "Let me know if you’d like case studies, a proposal draft, or a workshop agenda — happy to send resources tailored to your question.",
  );

  return response.join("\n");
}
