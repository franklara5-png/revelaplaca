/** Domínio canônico de produção (apex, sem www, sem barra final). */
export const PRODUCTION_SITE_URL = "https://revelaplaca.com.br";

export function getSiteUrl() {
  const url = process.env.NEXT_PUBLIC_SITE_URL;
  if (url) {
    const cleaned = url.replace(/\/$/, "");
    if (cleaned === "https://www.revelaplaca.com.br") {
      return PRODUCTION_SITE_URL;
    }
    return cleaned;
  }
  // Em produção na Vercel, nunca cair no hostname de preview/deployment.
  if (process.env.VERCEL_ENV === "production") {
    return PRODUCTION_SITE_URL;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3000";
}

export const SITE_NAME = "RevelaPlaca";
export const SITE_TAGLINE = "O que o vendedor não conta, a placa revela.";
export const SITE_DESCRIPTION =
  "Revele o histórico completo de qualquer veículo pela placa: leilão, sinistro, roubo, gravame e restrições antes de comprar.";
