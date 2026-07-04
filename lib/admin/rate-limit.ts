import "server-only";

import { and, eq, gte, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { adminLoginTentativas } from "@/db/schema";

const LIMITE = 5;
const JANELA_MS = 15 * 60 * 1000;

export async function contarTentativasLogin(ipHash: string): Promise<number> {
  const desde = new Date(Date.now() - JANELA_MS);

  const [resultado] = await getDb()
    .select({ total: sql<number>`count(*)::int` })
    .from(adminLoginTentativas)
    .where(
      and(
        eq(adminLoginTentativas.ipHash, ipHash),
        gte(adminLoginTentativas.criadaEm, desde),
      ),
    );

  return resultado?.total ?? 0;
}

export async function loginBloqueado(ipHash: string): Promise<boolean> {
  const total = await contarTentativasLogin(ipHash);
  return total >= LIMITE;
}

export async function registrarTentativaLogin(ipHash: string): Promise<void> {
  await getDb().insert(adminLoginTentativas).values({ ipHash });
}
