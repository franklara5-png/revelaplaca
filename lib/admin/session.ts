const COOKIE_NAME = "cp_admin_session";
const SESSION_DAYS = 7;

export { COOKIE_NAME };

export async function criarSessaoAdmin(): Promise<string> {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error("ADMIN_SESSION_SECRET não configurada");

  const { SignJWT } = await import("jose");
  const key = new TextEncoder().encode(secret);

  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(key);
}

export async function validarSessaoAdmin(
  token: string | undefined,
): Promise<boolean> {
  if (!token) return false;

  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) return false;

  try {
    const { jwtVerify } = await import("jose");
    const key = new TextEncoder().encode(secret);
    const { payload } = await jwtVerify(token, key);
    return payload.role === "admin";
  } catch {
    return false;
  }
}

export function opcoesCookieSessao() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  };
}
