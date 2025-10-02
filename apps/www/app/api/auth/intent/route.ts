import { NextResponse } from "next/server";
import { z } from "zod";

import { serverEnv } from "@/lib/env";

export const runtime = "nodejs";

const intentSchema = z.object({
  role: z.enum(["client", "staff"] as const),
  staffCode: z.string().optional(),
});

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = intentSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { errors: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const { role, staffCode } = parsed.data;
  const env = serverEnv();

  if (role === "staff" && staffCode !== env.STAFF_ACCESS_CODE) {
    return NextResponse.json({ error: "Invalid staff code" }, { status: 401 });
  }

  const response = NextResponse.json({ success: true, role });

  response.cookies.set("transformai_signup_role", role, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 5,
  });

  return response;
}
