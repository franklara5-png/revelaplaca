import "server-only";

import { and, eq, gte, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { eventosApiRate } from "@/db/schema";
import { obterIpHash } from "@/lib/ip-hash";

const LIMITE = 60;
const JANELA_MS = 60 * 60 * 1000;

export async function rateLimitEventosApiExcedido(): Promise<boolean> {
  const ipHash = await obterIpHash();
  const desde = new Date(Date.now() - JANELA_MS);

  const [row] = await getDb()
    .select({ total: sql<number>`count(*)::int` })
    .from(eventosApiRate)
    .where(
      and(eq(eventosApiRate.ipHash, ipHash), gte(eventosApiRate.criadaEm, desde)),
    );

  return (row?.total ?? 0) >= LIMITE;
}

export async function registrarHitEventosApi(): Promise<void> {
  const ipHash = await obterIpHash();
  await getDb().insert(eventosApiRate).values({ ipHash });
}
