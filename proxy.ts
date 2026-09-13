import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { COOKIE_NAME, validarSessaoAdmin } from "@/lib/admin/session";

export async function proxy(request: NextRequest) {
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

  // Admin login: redirect to /admin if already has a session VÁLIDA
  // (antes só checava se o cookie existia — qualquer valor, ate invalido,
  // passava. Isso deixava /admin inteiro aberto pra quem so setasse o
  // cookie manualmente, sem saber a senha.)
  if (pathname === "/admin/login") {
    if (await validarSessaoAdmin(token)) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return NextResponse.next();
  }

  // Other admin routes: block unless a sessao valida (JWT assinado e nao
  // expirado, ver lib/admin/session.ts) acompanha o cookie.
  if (!(await validarSessaoAdmin(token))) {
    const login = new URL("/admin/login", request.url);
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/painel/:path*"],
};
