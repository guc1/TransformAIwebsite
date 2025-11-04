"use server";
import { z } from "zod";

import {
  CONTACT_REQUEST_TYPES,
  type ContactRequestType,
} from "../constants";
import { db } from "@/lib/db/client";
import { isUndefinedTableError } from "@/lib/db/errors";
import { contactMessages } from "@/lib/db/schema";
import { locales } from "@/i18n/routing";

const REQUEST_TYPE_VALUES = CONTACT_REQUEST_TYPES.map((option) => option.value) as [
  ContactRequestType,
  ...ContactRequestType[],
];

const contactSchema = z.object({
  name: z
    .string({ required_error: "Name is required" })
    .trim()
    .min(2, { message: "Name must be at least 2 characters" })
    .max(120, { message: "Name must be under 120 characters" }),
  company: z
    .string()
    .trim()
    .max(120, { message: "Company name must be under 120 characters" })
    .optional(),
  email: z
    .string({ required_error: "Email is required" })
    .trim()
    .email({ message: "Email must be valid" }),
  requestType: z.enum(REQUEST_TYPE_VALUES, {
    errorMap: () => ({ message: "Select a request type" }),
  }),
  description: z
    .string({ required_error: "Tell us a little about the request" })
    .trim()
    .min(20, { message: "Description must be at least 20 characters" })
    .max(2000, { message: "Description must be under 2000 characters" }),
  locale: z.enum(locales, {
    errorMap: () => ({ message: "Locale is required" }),
  }),
});

export type ContactFormState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Partial<Record<keyof z.infer<typeof contactSchema>, string>>;
};

export async function sendContactMessage(
  _prevState: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const rawName = formData.get("name");
  const rawCompany = formData.get("company");
  const rawEmail = formData.get("email");
  const rawRequestType = formData.get("requestType");
  const rawDescription = formData.get("description");
  const rawLocale = formData.get("locale");

  const parsed = contactSchema.safeParse({
    name: typeof rawName === "string" ? rawName : "",
    company:
      typeof rawCompany === "string" && rawCompany.trim().length > 0
        ? rawCompany
        : undefined,
    email: typeof rawEmail === "string" ? rawEmail : "",
    requestType:
      typeof rawRequestType === "string"
        ? (rawRequestType as ContactRequestType)
        : undefined,
    description: typeof rawDescription === "string" ? rawDescription : "",
    locale: typeof rawLocale === "string" ? rawLocale : undefined,
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0];
      if (typeof field === "string" && !fieldErrors[field]) {
        fieldErrors[field] = issue.message;
      }
    }

    return {
      status: "error",
      fieldErrors,
      message: "Please review the highlighted fields and try again.",
    } satisfies ContactFormState;
  }

  const data = parsed.data;

  try {
    await db.insert(contactMessages).values({
      name: data.name,
      company: data.company ?? null,
      email: data.email,
      requestType: data.requestType,
      description: data.description,
      locale: data.locale,
    });
  } catch (error) {
    if (isUndefinedTableError(error)) {
      console.warn(
        "Contact form submission could not persist message because the contact_messages table is missing. Continuing with notifications.",
      );
    } else {
      console.error("Contact form submission failed while recording message:", error);
      return {
        status: "error",
        message:
          "We couldn't record your message right now. Please try again or email info@transformai.nl directly.",
      } satisfies ContactFormState;
    }
  }

  const requestTypeMeta = CONTACT_REQUEST_TYPES.find(
    (option) => option.value === data.requestType,
  );

  const requestLabel = requestTypeMeta?.emailLabel ?? data.requestType;

  const discordWebhook = process.env.CONTACT_DISCORD_WEBHOOK;
  if (discordWebhook) {
    const truncate = (value: string, max: number) =>
      value.length > max ? `${value.slice(0, max - 1)}…` : value;

    const discordPayload = {
      username: "TransformAI Contact",
      embeds: [
        {
          title: `New contact message – ${requestLabel}`,
          color: 0x2563eb,
          fields: [
            { name: "Name", value: data.name, inline: true },
            { name: "Email", value: data.email, inline: true },
            {
              name: "Company",
              value: data.company?.trim() ? data.company : "–",
              inline: true,
            },
            {
              name: "Request type",
              value: requestLabel,
              inline: true,
            },
            { name: "Locale", value: data.locale, inline: true },
            {
              name: "Message",
              value: truncate(data.description, 1024) || "(empty)",
            },
          ],
          timestamp: new Date().toISOString(),
        },
      ],
      allowed_mentions: { parse: [] as string[] },
    };

    try {
      const response = await fetch(discordWebhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(discordPayload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          "Contact form submission sent email but Discord webhook responded with status",
          response.status,
          errorText,
        );
      }
    } catch (error) {
      console.error("Contact form submission failed while notifying Discord:", error);
    }
  }

  return {
    status: "success",
    message: "Thank you for reaching out. We'll review your message shortly.",
  } satisfies ContactFormState;
}
