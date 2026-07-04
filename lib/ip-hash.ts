import "server-only";

import { createHash } from "crypto";
import { headers } from "next/headers";

function obterSalt(): string {
  return (
    process.env.IP_HASH_SALT ??
    process.env.TURNSTILE_SECRET_KEY ??
    "dev-salt-alterar-em-producao"
  );
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
