import { createHash } from "crypto";

export function hashIp(ip: string): string {
  const salt = process.env.IP_HASH_SALT ?? "dev-salt";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex");
}

export function mascararEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!local || !domain) return "***@***";
  const visivel = local.slice(0, 1);
  return `${visivel}***@${domain}`;
}
