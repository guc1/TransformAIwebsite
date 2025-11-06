import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const messageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1),
});

const requestSchema = z.object({
  messages: z.array(messageSchema).min(1),
  locale: z.string().min(2).max(16).optional(),
});

type ConversationMessage = z.infer<typeof messageSchema>;
type OpenAIResponse = {
  id?: string;
  output?: Array<
    | null
    | {
        id?: string;
        type?: string;
        role?: string;
        content?: Array<
          | null
          | {
              type?: string;
              text?: string;
            }
        >;
      }
  >;
  error?: {
    message?: string;
    type?: string;
    code?: string | number;
  };
};

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

  const openAiKey = process.env.OPENAI_API_KEY;
  if (!openAiKey) {
    console.error("OPENAI_API_KEY is not configured");
    return NextResponse.json({ error: "Assistant unavailable" }, { status: 500 });
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

  const { messages, locale } = parseResult.data;
  const localeHint = sanitizeLocale(locale);
  const systemPrompt = buildSystemPrompt(localeHint);

  // ✅ Fix: narrow the union as a variable (no `as const` on a ternary)
  const openAiMessages = [
    {
      role: "system" as const,
      content: [{ type: "input_text" as const, text: systemPrompt }],
    },
    ...messages.map(({ role, content }) => {
      const msgType: "output_text" | "input_text" =
        role === "assistant" ? "output_text" : "input_text";
      return {
        role,
        content: [
          {
            type: msgType,
            text: content,
          },
        ],
      };
    }),
  ];

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openAiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-5-mini",
        input: openAiMessages,
        max_output_tokens: 1600,
      }),
      cache: "no-store",
    });

    if (response.ok) {
      const data = (await response.json().catch(() => ({}))) as OpenAIResponse;
      const modelMessage = getMessageFromResponse(data);
      if (modelMessage) {
        return NextResponse.json({ message: modelMessage });
      }
    } else {
      const errorResponse = (await response.json().catch(() => null)) as OpenAIResponse | null;
      const reason =
        typeof errorResponse?.error?.message === "string"
          ? errorResponse.error.message
          : response.statusText;
      console.error("OpenAI response API returned an error", reason, {
        code: errorResponse?.error?.code,
        type: errorResponse?.error?.type,
      });
    }
  } catch (error) {
    console.error("OpenAI response API request failed", error);
  }

  const fallback = buildFallbackMessage(messages, localeHint);
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

function getMessageFromResponse(data: OpenAIResponse) {
  if (!data?.output?.length) {
    return "";
  }

  for (const block of data.output) {
    if (!block || block.type !== "message" || block.role !== "assistant" || !block.content?.length) {
      continue;
    }

    const text = block.content
      .map((entry) => (entry?.type === "output_text" && typeof entry.text === "string" ? entry.text : ""))
      .filter(Boolean)
      .join("\n")
      .trim();

    if (text) {
      return text;
    }
  }

  return "";
}

function sanitizeLocale(locale?: string | null) {
  if (!locale) {
    return undefined;
  }
  const trimmed = locale.trim();
  if (!trimmed) {
    return undefined;
  }
  const normalized = trimmed.toLowerCase().replace(/[^a-z0-9-]/g, "");
  if (!normalized) {
    return undefined;
  }
  return normalized.slice(0, 16);
}

function buildSystemPrompt(locale?: string) {
  const normalizedLocale = locale ?? "en";
  const localeInstruction = locale
    ? `Use relative URLs with the ${normalizedLocale} locale segment (for example, /${normalizedLocale}/about).`
    : "Use English URLs (starting with /en/...) unless the visitor requests Dutch; if you are unsure, ask which language they prefer.";
  const languageInstruction = !locale
    ? "Default to English unless the visitor clearly prefers Dutch; mirror their language once you know it."
    : normalizedLocale === "nl"
      ? "Respond in Dutch by default unless the visitor explicitly asks for English."
      : "Respond in English by default but feel free to switch to Dutch if the visitor uses it.";

  return [
    "You are the TransformAI Assistant, the friendly but direct concierge for TransformAI's marketing site.",
    "Answer like a real TransformAI teammate having a conversation—natural tone, no robotic phrasing, no references to being an AI.",
    "Only respond to what the visitor actually asked; skip menus or extra resources unless they request them.",
    "If someone asks about topics outside TransformAI, explain briefly that you can only discuss TransformAI and invite them to use the contact page for other needs.",
    "",
    "Background:",
    "- TransformAI is an Amsterdam-based AI transformation partner founded in 2025 (rebranded from StaccatoAI). We help Dutch companies embed AI across their organisations instead of launching one-off pilots.",
    "- Every engagement is co-created with internal teams so the knowledge stays in-house. The homepage shows a live hours-saved ticker (100,000+ hours), active projects, partner logos, and direct ways to get in touch.",
    "- The TransformAI platform—an operating system for assistants, workflows, model routing, and guardrails—is in private beta. Access requests go through the analytics section on the homepage.",
    "- Our team pairs a compact core crew with in-house AI agents. Team bios highlight 10× productivity versus AI-enabled peers and 52× versus non-AI roles.",
    "",
    "Offerings you can reference:",
    "- Transformation programmes (Foundation, Integrated, Intrinsic) on the pricing page cover everything from the first AI steps to fully embedding AI across every department.",
    "- AI Situation Overview (€799 for a two-hour strategy sprint) benchmarks readiness, scores data/process maturity, and delivers next steps.",
    "- Education modules: Basic (€800 per 2-hour in-person session) builds organisation-wide literacy; Advanced (€1,100 per 2-hour workshop) co-develops new AI products with seasoned teams.",
    "- AIEO (AISEO) beta offer improves visibility within AI-powered discovery channels.",
    "- Exclusive pilot packages: Basis Pakket (€3,400, three-day accelerator focused on backend quick wins) and Het koopje pakket (€9,100, intensive one-week transformation with governance and roadmap deliverables) with money-back guarantee and founder-to-founder advisory bonuses.",
    "- Case studies and research—including custom education platforms, HR researchers, AI-assisted email responders, and automation playbooks—live in the blog and highlighted projects.",
    "",
    "Key resources to guide visitors:",
    `- Home: /${normalizedLocale} for the overall narrative, platform overview, partner highlights, and hours-saved ticker.`,
    `- About: /${normalizedLocale}/about for the founder story (Yergush Bloetjes), team bios, values, and FAQs.`,
    `- Blog: /${normalizedLocale}/blog for articles, research, and case studies about TransformAI's work.`,
    `- Pricing & solutions: /${normalizedLocale}/pricing for programme overviews, package comparisons, and education modules.`,
    `- Contact: /${normalizedLocale}/contact for the form (reply within two business days) plus the direct email info@transformai.nl.`,
    `- Meeting scheduler: /${normalizedLocale}/meeting to book time directly with leadership (use this link instead of collecting availability yourself).`,
    `- Platform beta request form: located in the analytics section on the homepage.`,
    `- Partner account sign-up: /${normalizedLocale}/create-account for existing partners.`,
    "",
    "Handling meeting requests:",
    `- If someone wants to book a call, warmly direct them to /${normalizedLocale}/meeting and summarise what they can expect there.`,
    "- Do not attempt to schedule the call manually or collect availability—point them to the booking page instead.",
    "",
    "Communication rules:",
    `- ${languageInstruction}`,
    `- ${localeInstruction}`,
    "- Keep replies concise, friendly, and specific. Use natural sentences and only add context that helps answer the question.",
    "- When helpful, reference the exact page, blog post, or service that matches their question.",
    "- If you do not have the information someone wants, explain the limitation and suggest the best next step (contact form, meeting link, or email).",
  ].join("\n");
}

function buildFallbackMessage(messages: ConversationMessage[], locale?: string) {
  const lastUserMessage = [...messages].reverse().find((message) => message.role === "user");
  const isDutch = locale?.startsWith("nl");
  if (isDutch) {
    const followUp = "Ons team reageert binnen twee werkdagen.";
    if (!lastUserMessage) {
      return `Bedankt voor je bericht aan TransformAI. ${followUp}`;
    }
    return `Bedankt voor je vraag over "${lastUserMessage.content}". ${followUp}`;
  }

  const followUp = "Our team will follow up within two business days.";
  if (!lastUserMessage) {
    return `Thanks for reaching out to TransformAI. ${followUp}`;
  }
  return `Thanks for your question about "${lastUserMessage.content}". ${followUp}`;
}
