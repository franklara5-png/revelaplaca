import "server-only";

import { and, eq, gte, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { siteVisits } from "@/db/schema";

/**
 * Trava de abuso do /api/track/visit.
 *
 * A rota e POST publico, sem autenticacao e sem custo para quem chama: um loop
 * simples inseria linha no banco indefinidamente. O filtro de user-agent que ja
 * existia nao segura nada nesse cenario — basta mandar um UA de navegador.
 *
 * O limite conta a propria site_visits, entao nao precisa de tabela nova: o que
 * queremos limitar e exatamente o que ela grava.
 *
 * 120/hora e folgado para navegacao humana (o tracker dispara 1 por navegacao)
 * e apertado para script.
 */
const LIMITE_POR_HORA = 120;

export async function visitaRateLimitExcedido(
  ipHash: string,
): Promise<boolean> {
  const desde = new Date(Date.now() - 60 * 60 * 1000);

  const [row] = await getDb()
    .select({ total: sql<number>`count(*)::int` })
    .from(siteVisits)
    .where(
      and(eq(siteVisits.ipHash, ipHash), gte(siteVisits.visitedAt, desde)),
    );

  return (row?.total ?? 0) >= LIMITE_POR_HORA;
}

/**
 * Expurgo por retencao.
 *
 * Nao havia nenhum: a tabela crescia para sempre. Guardar log de navegacao
 * indefinidamente nao se sustenta sob o principio da necessidade da LGPD, e
 * 90 dias e a mesma janela que o site ja pratica no acesso ao relatorio pago —
 * fica coerente e facil de justificar.
 */
export const RETENCAO_DIAS = 90;

export async function limparVisitasAntigas(): Promise<number> {
  const linhas = await getDb()
    .delete(siteVisits)
    .where(
      sql`${siteVisits.visitedAt} < now() - make_interval(days => ${RETENCAO_DIAS})`,
    )
    .returning({ id: siteVisits.id });

  return linhas.length;
}
