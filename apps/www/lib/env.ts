import { z } from "zod";

const clientSchema = z.object({
  NEXT_PUBLIC_BASE_URL: z
    .string()
    .url()
    .default("https://transformai.nl"),
  NEXT_PUBLIC_C15T_MODE: z.enum(["c15t", "offline"]).nullable().optional(),
});

const serverSchema = clientSchema.extend({
  DATABASE_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(1),
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  STAFF_ACCESS_CODE: z.string().min(1).default("Cake2025"),
});

let cachedClientEnv: z.infer<typeof clientSchema> | undefined;
let cachedServerEnv: z.infer<typeof serverSchema> | undefined;

export const env = () => {
  if (!cachedClientEnv) {
    cachedClientEnv = clientSchema.parse(process.env);
  }

  return cachedClientEnv;
};

export const serverEnv = () => {
  if (!cachedServerEnv) {
    cachedServerEnv = serverSchema.parse(process.env);
  }

  return cachedServerEnv;
};
