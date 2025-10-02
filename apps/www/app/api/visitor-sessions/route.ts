import { NextRequest, NextResponse } from "next/server";

import {
  VISITOR_COOKIE_MAX_AGE_SECONDS,
  VISITOR_COOKIE_NAME,
} from "@/lib/visitors/constants";
import { recordVisitorSession } from "@/lib/visitors";

export async function POST(request: NextRequest) {
  const existing = request.cookies.get(VISITOR_COOKIE_NAME);

  if (existing?.value) {
    return NextResponse.json({ visitorId: existing.value, created: false });
  }

  const visitorId = crypto.randomUUID();
  const response = NextResponse.json({ visitorId, created: true });

  response.cookies.set({
    name: VISITOR_COOKIE_NAME,
    value: visitorId,
    path: "/",
    sameSite: "lax",
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    maxAge: VISITOR_COOKIE_MAX_AGE_SECONDS,
  });

  await recordVisitorSession(visitorId);

  return response;
}
