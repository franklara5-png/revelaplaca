import { createHash, randomBytes } from "crypto";

const input = process.argv[2];

if (!input) {
  console.error('Uso: node scripts/gera-hash-admin.mjs "minha-senha"');
  process.exit(1);
}

const bcrypt = await import("bcryptjs");
const salt = randomBytes(16).toString("hex");
const hash = await bcrypt.hash(input, 12);

console.log("\nAdicione ao .env.local / Vercel:\n");
console.log(`ADMIN_PASSWORD_HASH=${hash}`);
console.log(`ADMIN_SESSION_SECRET=${createHash("sha256").update(randomBytes(32)).digest("hex")}`);
console.log(`CRON_SECRET=${createHash("sha256").update(randomBytes(32)).digest("hex")}`);
console.log("");
