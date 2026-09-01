import "server-only";

import { createHash } from "crypto";
import { headers } from "next/headers";

/**
 * O salt e o que impede o hash de IP de ser reversivel.
 *
 * O fallback final e uma string FIXA e publica — esta neste arquivo, no repo.
 * Com ela, reverter um IPv4 a partir do sha256 e questao de minutos: sao 2^32
 * candidatos. Ou seja, em producao sem IP_HASH_SALT o "hash de IP" deixa de
 * ser pseudonimizacao e vira IP em claro com passos extras, que e exatamente o
 * oposto do motivo de existir.
 *
 * Por isso em producao ele falha alto em vez de degradar em silencio.
 */
function obterSalt(): string {
  const salt = process.env.IP_HASH_SALT ?? process.env.TURNSTILE_SECRET_KEY;
  if (salt) return salt;

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "IP_HASH_SALT nao configurada: sem ela o hash de IP e reversivel.",
    );
  }

  return "dev-salt-alterar-em-producao";
}

export async function obterIpCliente(): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() ?? "0.0.0.0";
  return h.get("x-real-ip") ?? "0.0.0.0";
}

export function hashIp(ip: string): string {
  return createHash("sha256")
    .update(`${ip}:${obterSalt()}`)
    .digest("hex");
}

export async function obterIpHash(): Promise<string> {
  return hashIp(await obterIpCliente());
}
