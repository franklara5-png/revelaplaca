/**
 * Gera os segredos que nao dependem de servico externo.
 *
 * Uso:
 *   node scripts/gera-hash-admin.mjs "minha-senha-de-admin"
 *
 * Rode voce mesmo e copie a saida direto para a Vercel. NAO cole o resultado
 * numa conversa: segredo em transcript e segredo vazado — foi assim que a
 * senha do Neon acabou exposta em 31/08/2026.
 *
 * As demais variaveis criticas (Turnstile, fornecedor, Brevo, Asaas) vem de
 * paineis de terceiros e nao podem ser geradas aqui.
 */
import { randomBytes } from "crypto";

const senha = process.argv[2];

if (!senha) {
  console.error('Uso: node scripts/gera-hash-admin.mjs "minha-senha"');
  process.exit(1);
}

const bcrypt = await import("bcryptjs");
// O bcrypt gera o proprio salt a partir do custo — nao precisa de randomBytes
// aqui, e gerar um por fora so daria a impressao errada de que ele e usado.
const hash = await bcrypt.hash(senha, 12);

/** 32 bytes de aleatoriedade criptografica, em hex. */
const segredo = () => randomBytes(32).toString("hex");

console.log("\nAdicione na Vercel (Production) e no .env.local:\n");
console.log(`ADMIN_PASSWORD_HASH=${hash}`);
console.log(`ADMIN_SESSION_SECRET=${segredo()}`);
console.log(`CRON_SECRET=${segredo()}`);
// Sem esta, o hash de IP vira reversivel e o codigo recusa operar em producao.
console.log(`IP_HASH_SALT=${segredo()}`);
console.log(
  "\nDepois de colar na Vercel, faca REDEPLOY. Variavel nova nao vale para o\n" +
    "build que ja esta no ar.\n",
);
