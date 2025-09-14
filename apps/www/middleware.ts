import { NextRequest, NextResponse } from "next/server";

const EDITOR_COOKIE = "editor_code";

export const config = {
  matcher: ["/admin/blog/:path*", "/api/admin/blog/:path*"],
};

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname === "/api/admin/blog/login") {
    return NextResponse.next();
  }

  const hasSession = req.cookies.get(EDITOR_COOKIE)?.value === "true";

  if (!hasSession) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    if (pathname !== "/admin/blog/new") {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/blog/new";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}
