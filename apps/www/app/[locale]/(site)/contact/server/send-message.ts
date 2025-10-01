"use server";

import { Resend } from "resend";
import { z } from "zod";

import {
  CONTACT_REQUEST_TYPES,
  type ContactRequestType,
} from "../constants";

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
    .string()
    .trim()
    .email({ message: "Email must be valid" })
    .optional(),
  requestType: z.enum(REQUEST_TYPE_VALUES, {
    errorMap: () => ({ message: "Select a request type" }),
  }),
  description: z
    .string({ required_error: "Tell us a little about the request" })
    .trim()
    .min(20, { message: "Description must be at least 20 characters" })
    .max(2000, { message: "Description must be under 2000 characters" }),
});

export type ContactFormState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Partial<Record<keyof z.infer<typeof contactSchema>, string>>;
};

export const initialState: ContactFormState = {
  status: "idle",
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

  const parsed = contactSchema.safeParse({
    name: typeof rawName === "string" ? rawName : "",
    company:
      typeof rawCompany === "string" && rawCompany.trim().length > 0
        ? rawCompany
        : undefined,
    email:
      typeof rawEmail === "string" && rawEmail.trim().length > 0
        ? rawEmail
        : undefined,
    requestType:
      typeof rawRequestType === "string"
        ? (rawRequestType as ContactRequestType)
        : undefined,
    description: typeof rawDescription === "string" ? rawDescription : "",
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
  const resendApiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.CONTACT_FROM_EMAIL ?? "TransformAI <info@transformai.nl>";
  const forwardTo = process.env.CONTACT_FORWARD_TO;

  if (!resendApiKey || !forwardTo) {
    console.error(
      "Contact form submission failed: Missing RESEND_API_KEY or CONTACT_FORWARD_TO.",
    );
    return {
      status: "error",
      message:
        "We couldn't send your message right now. Please email info@transformai.nl while we look into this.",
    } satisfies ContactFormState;
  }

  const resend = new Resend(resendApiKey);
  const requestTypeMeta = CONTACT_REQUEST_TYPES.find(
    (option) => option.value === data.requestType,
  );

  const requestLabel = requestTypeMeta?.emailLabel ?? data.requestType;

const emailBody = [
    `Name: ${data.name}`,
    data.company ? `Company: ${data.company}` : null,
    `Request type: ${requestLabel}`,
    data.email ? `Contact email: ${data.email}` : "Contact email: not provided",
    "",
    "Request description:",
    data.description,
  ]
    .filter(Boolean)
    .join("\n");

  try {
    await resend.emails.send({
      from: fromEmail,
      to: forwardTo,
      subject: `New TransformAI contact request – ${requestLabel}`,
      text: emailBody,
      html: emailBody
        .split("\n")
        .map(
          (line) =>
            `<p style="margin:0 0 12px;font-size:14px;line-height:20px;">${escapeHtml(
              line,
            )}</p>`,
        )
        .join(""),
      reply_to: data.email ?? undefined,
      headers: {
        "X-TransformAI-Request-Type": data.requestType,
      },
    });
  } catch (error) {
    console.error("Contact form submission failed while sending email:", error);
    return {
      status: "error",
      message:
        "Something went wrong while sending your message. Please try again or email info@transformai.nl directly.",
    } satisfies ContactFormState;
  }

  return {
    status: "success",
    message: "Thank you for reaching out. We'll follow up from info@transformai.nl soon.",
  } satisfies ContactFormState;
}

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
