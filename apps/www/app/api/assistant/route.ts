import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const messageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1),
});

const requestSchema = z.object({
  messages: z.array(messageSchema).min(1),
  locale: z.string().min(2).max(16).optional(),
  language: z.enum(["en", "nl"]).optional(),
});

const assistantRedirectSchema = z.object({
  url: z.string().min(1),
  label: z.string().min(1),
  confirm: z.string().min(1),
});

const assistantResponseSchema = z.object({
  reply: z.string().min(1),
  language: z.enum(["en", "nl"]).optional(),
  redirect: assistantRedirectSchema.optional(),
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
const OUTPUT_TOKEN_LIMIT = 4000;

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

  const { messages, locale, language } = parseResult.data;
  const localeHint = sanitizeLocale(locale);
  const visitorLanguage = language ?? inferConversationLanguage(messages, localeHint);
  const systemPrompt = buildSystemPrompt(localeHint, visitorLanguage);
  const openAiMessages = [
    {
      role: "system" as const,
      content: [{ type: "input_text" as const, text: systemPrompt }],
    },
    ...messages.map(({ role, content }) => ({
      role,
      content: [
        {
          type: (role === "assistant" ? "output_text" : "input_text") as const,
          text: content,
        },
      ],
    })),
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
        max_output_tokens: OUTPUT_TOKEN_LIMIT,
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "transformai_chat_response",
            schema: {
              type: "object",
              additionalProperties: false,
              properties: {
                reply: { type: "string", description: "Primary reply shown to the visitor." },
                language: {
                  type: "string",
                  enum: ["en", "nl"],
                  description: "Language code (en or nl) matching the visitor's preference.",
                },
                redirect: {
                  type: "object",
                  additionalProperties: false,
                  required: ["url", "label", "confirm"],
                  properties: {
                    url: {
                      type: "string",
                      description: "Absolute or locale-prefixed path to redirect the visitor to.",
                    },
                    label: {
                      type: "string",
                      description: "Label for the redirect confirmation button in the visitor's language.",
                    },
                    confirm: {
                      type: "string",
                      description: "Question asking if the visitor would like to be redirected now.",
                    },
                  },
                },
              },
              required: ["reply"],
            },
          },
        },
      }),
      cache: "no-store",
    });

    if (response.ok) {
      const data = (await response.json().catch(() => ({}))) as OpenAIResponse;
      const modelMessage = getAssistantPayload(data);
      if (modelMessage) {
        return NextResponse.json({
          reply: modelMessage.reply,
          language: modelMessage.language ?? visitorLanguage,
          redirect: modelMessage.redirect ?? null,
        });
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

  const fallback = buildFallbackMessage(messages, localeHint, visitorLanguage);
  return NextResponse.json({ reply: fallback.reply, language: fallback.language, redirect: null });
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

function getAssistantPayload(data: OpenAIResponse) {
  if (!data?.output?.length) {
    return null;
  }

  for (const block of data.output) {
    if (!block || block.type !== "message" || block.role !== "assistant" || !block.content?.length) {
      continue;
    }

    const text = block.content
      .map((entry) => (entry?.type === "output_text" && typeof entry.text === "string" ? entry.text : ""))
      .filter(Boolean)
      .join("")
      .trim();

    if (!text) {
      continue;
    }

    const parsed = safeParseAssistantPayload(text);
    if (parsed) {
      return parsed;
    }
  }

  return null;
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

function buildSystemPrompt(locale: string | undefined, visitorLanguage: "en" | "nl") {
  const normalizedLocale = locale ?? "en";
  const localeInstruction = locale
    ? `Use relative URLs with the ${normalizedLocale} locale segment (for example, /${normalizedLocale}/about).`
    : "Use English URLs (starting with /en/...) unless the visitor requests Dutch; if you are unsure, ask which language they prefer.";
  const languageInstruction = visitorLanguage === "nl"
    ? "Respond in Dutch unless the visitor explicitly asks for English."
    : "Respond in English unless the visitor explicitly switches to Dutch.";

  return [
    "You are the TransformAI Assistant, the friendly but direct concierge for TransformAI's marketing site.",
    "You only answer questions about TransformAI's services, platform, team, and resources. If someone asks about anything else, politely explain that you can only discuss TransformAI.",
    "",
    `VisitorLanguage=${visitorLanguage}. Mirror this language unless the visitor clearly switches.`,
    "Background:",
    "- TransformAI is an AI transformation partner based in Amsterdam, Netherlands. The company was founded in 2025 and rebranded from StaccatoAI to reflect its move from building standalone products to guiding full-scale AI transformations.",
    "- We work as a long-term partner rather than a short-term consultant. Every engagement is co-created with the client's teams so AI becomes embedded across the organisation, whether they are just starting or scaling advanced automation.",
    "- The homepage highlights more than 100,000 hours saved for partners, showcases active projects and partner logos, and gives direct ways to chat, contact us, or schedule time.",
    "- A TransformAI platform (a central operating system for assistants, workflows, and guardrails) is in private beta. Visitors can request access via the analytics section on the homepage.",
    "",
    "Offerings you can reference:",
    "- Education modules on the pricing page: the Basic education module (€800 per 2-hour in-person session) builds AI confidence across roles, and the Advanced education module (€1,100 per 2-hour workshop) co-develops new AI products with experienced teams.",
    "- AISEO package (AIEO) beta to improve visibility inside AI-powered discovery channels.",
    "- AI Situation Overview (€799 for a two-hour strategy sprint) benchmarks a company's AI readiness and delivers next-step recommendations.",
    "- Transformation programmes (Foundation, Integrated, Intrinsic) described on the pricing page cover everything from the first AI steps to fully integrated company-wide adoption.",
    "- Case studies and research—including the education platform, HR researcher, email responder, and automation playbooks—are published in the blog and highlighted projects.",
    "",
    "Key resources to guide visitors:",
    `- Home: /${normalizedLocale} for the overall story, hours-saved ticker, and partner highlights.`,
    `- About: /${normalizedLocale}/about for the founder story, team bios (showing 10× productivity vs. AI-enabled peers and 52× vs. non-AI roles), values, and FAQs.`,
    `- Blog: /${normalizedLocale}/blog for articles, research, and case studies about TransformAI's work.`,
    `- Pricing & solutions: /${normalizedLocale}/pricing for solution overviews, package comparisons, and education modules.`,
    `- Contact: /${normalizedLocale}/contact for the contact form (TransformAI replies within two business days) with request types for general questions, solution inquiries, AI help, or other topics, plus the direct email info@transformai.nl.`,
    `- Meeting scheduler: /${normalizedLocale}/meeting to reserve time with the team—bookings go straight to leadership.`,
    `- Platform beta request form: available from the analytics section on the homepage.`,
    `- Partner account sign-up: /${normalizedLocale}/create-account (access is limited to TransformAI partners).`,
    "",
    "Meeting support:",
    "- Offer to help schedule meetings proactively. Collect the person's name, company, email, focus areas, and timing preferences.",
    `- When they are ready, share the meeting link (/${normalizedLocale}/meeting) and summarise what they should submit.`,
    "",
    "Redirect support:",
    "- When recommending a page, include a redirect suggestion so the visitor can jump straight there.",
    "- Ask for confirmation first (for example: 'Should I redirect you to the pricing page now?').",
    `- Provide the locale-aware URL in the redirect object (for example, /${normalizedLocale}/pricing).`,
    "",
    "Communication rules:",
    `- ${languageInstruction}`,
    `- ${localeInstruction}`,
    "- Be friendly, clear, and straightforward. Provide direct answers without unnecessary padding.",
    "- Whenever helpful, point people to the exact page, blog post, or service so they know where to continue.",
    "- If you do not have the information someone wants, explain the limitation and recommend the best next step (contact form, meeting, or email).",
    "- Stay strictly within TransformAI's domain; acknowledge the question and decline if it falls outside TransformAI.",
    "",
    "Response contract:",
    "- Return valid JSON that matches the transformai_chat_response schema (reply, optional language, optional redirect).",
    "- Put the full conversational answer inside reply. Do not include Markdown backticks or extra commentary outside the JSON body.",
    "- If offering a redirect, ensure the confirm string invites the visitor to opt-in explicitly.",
  ].join("\n");
}

function buildFallbackMessage(
  messages: ConversationMessage[],
  locale: string | undefined,
  visitorLanguage: "en" | "nl",
) {
  const lastUserMessage = [...messages].reverse().find((message) => message.role === "user");
  const isDutch = visitorLanguage === "nl" || locale?.startsWith("nl");
  if (isDutch) {
    const followUp = "Ons team reageert binnen twee werkdagen.";
    if (!lastUserMessage) {
      return { reply: `Bedankt voor je bericht aan TransformAI. ${followUp}`, language: "nl" as const };
    }
    return {
      reply: `Bedankt voor je vraag over "${lastUserMessage.content}". ${followUp}`,
      language: "nl" as const,
    };
  }

  const followUp = "Our team will follow up within two business days.";
  if (!lastUserMessage) {
    return { reply: `Thanks for reaching out to TransformAI. ${followUp}`, language: "en" as const };
  }
  return {
    reply: `Thanks for your question about "${lastUserMessage.content}". ${followUp}`,
    language: "en" as const,
  };
}

function safeParseAssistantPayload(raw: string) {
  try {
    const parsed = JSON.parse(raw);
    const result = assistantResponseSchema.safeParse(parsed);
    if (result.success) {
      return result.data;
    }
  } catch (error) {
    console.error("Failed to parse assistant payload", error);
  }
  return null;
}

function inferConversationLanguage(messages: ConversationMessage[], locale?: string | null): "en" | "nl" {
  if (locale?.startsWith("nl")) {
    return "nl";
  }

  const lastUserMessage = [...messages].reverse().find((message) => message.role === "user");
  if (!lastUserMessage) {
    return "en";
  }

  const text = lastUserMessage.content.toLowerCase();
  const dutchPatterns = [
    /\bde\b/,
    /\bhet\b/,
    /\ben\b/,
    /\bhoe\b/,
    /\bwaarom\b/,
    /\bdank/,
    /\bmet\b/,
    /\bvoor\b/,
    /\bkun\w*/,
    /\bbedrijf\b/,
    /\bafspraak\b/,
    /\bspreek\b/,
  ];
  const matches = dutchPatterns.reduce((total, pattern) => total + (pattern.test(text) ? 1 : 0), 0);
  if (matches >= 2 || /[äëïöüáéíóú]/.test(text) || text.includes("ij")) {
    return "nl";
  }
  return "en";
}
