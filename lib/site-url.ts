export function getSiteUrl() {
  const url = process.env.NEXT_PUBLIC_SITE_URL;
  if (url) return url.replace(/\/$/, "");
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

export const SITE_NAME = "RevelaPlaca";
export const SITE_TAGLINE = "O que o vendedor não conta, a placa revela.";
export const SITE_DESCRIPTION =
  "Revele o histórico completo de qualquer veículo pela placa: leilão, sinistro, roubo, gravame e restrições antes de comprar.";
