import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ADMIN_PREFIX = "/admin/blog";

export function middleware(req: NextRequest) {
  const isAdminRoute = req.nextUrl.pathname.startsWith(ADMIN_PREFIX);
  const isApiRoute = req.nextUrl.pathname.startsWith("/api/admin/blog");
  if (isAdminRoute || isApiRoute) {
    const token = req.cookies.get("editor_token");
    if (
      token?.value !== "granted" &&
      req.nextUrl.pathname !== "/admin/blog/new"
    ) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/blog/new";
      return NextResponse.redirect(url);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/blog/:path*", "/api/admin/blog/:path*"],
};
