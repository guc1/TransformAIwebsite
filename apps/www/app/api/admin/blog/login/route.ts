import { NextRequest, NextResponse } from "next/server";

const CODE = "cake2025";
const COOKIE = "editor_code";

export async function POST(req: NextRequest) {
  const { code } = await req.json();
  if (code === CODE) {
    const res = NextResponse.json({ ok: true });
    res.cookies.set(COOKIE, "true", { httpOnly: true, maxAge: 60 * 60 });
    return res;
  }
  return NextResponse.json({ ok: false }, { status: 401 });
}
