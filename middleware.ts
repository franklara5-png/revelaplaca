import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const COOKIE_NAME = "cp_admin_session";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ─── Painel do cliente (Better Auth) — otimista, só cookie ────────────
  if (pathname === "/painel" || pathname.startsWith("/painel/")) {
    const sessionToken = request.cookies.get("better-auth.session_token")?.value;
    if (!sessionToken) {
      const login = new URL("/login", request.url);
      login.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(login);
    }
    return NextResponse.next();
  }

  // ─── Admin (senha) ─────────────────────────────────────────────────────
  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  const token = request.cookies.get(COOKIE_NAME)?.value;

  // Admin login: redirect to /admin if already has a session cookie
  if (pathname === "/admin/login") {
    if (token) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return NextResponse.next();
  }

  // Other admin routes: block if no session cookie
  if (!token) {
    const login = new URL("/admin/login", request.url);
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/painel/:path*"],
};
