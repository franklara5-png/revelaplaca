import "server-only";

type TurnstileResponse = {
  success: boolean;
  "error-codes"?: string[];
};

export async function validarTurnstile(token: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    console.error("[turnstile] TURNSTILE_SECRET_KEY não configurada");
    return false;
  }

  if (!token) return false;

  const body = new URLSearchParams({
    secret,
    response: token,
  });

  try {
    const res = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
        signal: AbortSignal.timeout(5_000),
      },
    );

    if (!res.ok) return false;

    const data = (await res.json()) as TurnstileResponse;
    return data.success === true;
  } catch (erro) {
    console.error("[turnstile] erro na verificação:", erro);
    return false;
  }
}

export function turnstileConfigurado(): boolean {
  return Boolean(
    process.env.TURNSTILE_SECRET_KEY &&
      process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
  );
}
