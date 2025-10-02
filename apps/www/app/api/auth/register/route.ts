import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { serverEnv } from "@/lib/env";

export const runtime = "nodejs";

const registerSchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(100).optional(),
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["client", "staff"] as const),
  staffCode: z.string().optional(),
});

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);

  const parsed = registerSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { errors: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const { email, password, name, role, staffCode } = parsed.data;
  const env = serverEnv();

  if (role === "staff" && staffCode !== env.STAFF_ACCESS_CODE) {
    return NextResponse.json({ error: "Invalid staff code" }, { status: 401 });
  }

  const normalizedEmail = email.toLowerCase();

  const existing = await db.query.users.findFirst({
    where: eq(users.email, normalizedEmail),
    columns: { id: true },
  });

  if (existing) {
    return NextResponse.json({ error: "An account already exists" }, { status: 409 });
  }

  const passwordHash = await hash(password, 12);

  await db.insert(users).values({
    email: normalizedEmail,
    name: name ?? null,
    passwordHash,
    role,
    emailVerified: new Date(),
  });

  return NextResponse.json({ success: true, role }, { status: 201 });
}
