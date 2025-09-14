import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { code } = await req.json().catch(() => ({ code: "" }));
  if (code === "cake2025") {
    const res = NextResponse.json({ ok: true });
    res.cookies.set("editor_token", "granted", {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60,
      path: "/",
    });
    return res;
  }
  return NextResponse.json({ ok: false }, { status: 401 });
}
