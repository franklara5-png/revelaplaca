import "server-only";

import { and, eq, gte, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { eventosApiRate } from "@/db/schema";
import { obterIpHash } from "@/lib/ip-hash";

const LIMITE = 60;
const JANELA_MS = 60 * 60 * 1000;

/**
 * O hash de IP lanca em producao quando IP_HASH_SALT nao esta configurada —
 * de proposito, para nunca guardar hash reversivel. Mas este limitador roda no
 * inicio de /api/eventos e /api/contrato/pdf, entao deixar a excecao subir
 * transformava erro de configuracao em HTTP 500 nessas rotas.
 *
 * Aqui a degradacao correta e ficar INERTE, nao derrubar: sem salt nao da para
 * identificar o chamador, entao nao da para limitar nem para registrar. As
 * rotas seguem funcionando, o log grita, e nenhum dado mal-formado e gravado.
 */
async function ipHashOuNulo(): Promise<string | null> {
  try {
    return await obterIpHash();
  } catch (erro) {
    console.error(
      "[rate-limit] sem IP_HASH_SALT: limitador inerte nesta requisicao.",
      erro,
    );
    return null;
  }
}

export async function rateLimitEventosApiExcedido(): Promise<boolean> {
  const ipHash = await ipHashOuNulo();
  if (!ipHash) return false;

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
  const ipHash = await ipHashOuNulo();
  if (!ipHash) return;

  await getDb().insert(eventosApiRate).values({ ipHash });
}
