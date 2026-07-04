import "server-only";

import { and, eq, gte, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { consultas } from "@/db/schema";

const LIMITE_POR_HORA = 5;

export async function contarConsultasRecentes(ipHash: string): Promise<number> {
  const umaHoraAtras = new Date(Date.now() - 60 * 60 * 1000);

  const [resultado] = await getDb()
    .select({ total: sql<number>`count(*)::int` })
    .from(consultas)
    .where(
      and(eq(consultas.ipHash, ipHash), gte(consultas.criadaEm, umaHoraAtras)),
    );

  return resultado?.total ?? 0;
}

export async function rateLimitExcedido(ipHash: string): Promise<boolean> {
  const total = await contarConsultasRecentes(ipHash);
  return total >= LIMITE_POR_HORA;
}

export async function registrarConsulta(input: {
  placa: string;
  ipHash: string;
  origem?: string | null;
  cacheHit: boolean;
}) {
  await getDb().insert(consultas).values({
    placa: input.placa,
    ipHash: input.ipHash,
    origem: input.origem ?? null,
    cacheHit: input.cacheHit,
  });
}
