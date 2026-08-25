import "server-only";

import { and, desc, gte, isNotNull, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { siteVisits } from "@/db/schema";
import { obterMetricasDashboard } from "@/lib/admin/stats";

// Início do dia de hoje em America/Sao_Paulo, como timestamptz — calculado no
// banco (não no processo Node, que na Vercel roda em UTC) para bater com o
// fuso do negócio independente de onde a função executa.
const INICIO_HOJE_SP = sql`(date_trunc('day', now() at time zone 'America/Sao_Paulo') at time zone 'America/Sao_Paulo')`;

export type HermesIpEntry = {
  ip: string;
  city?: string;
  region?: string;
  country?: string;
  views: number;
  lastAt: string;
};

export type HermesStats = {
  clientes: number;
  onlineAgora: number;
  visitantesHoje: number;
  ipsHoje: number;
  ipsLista: HermesIpEntry[];
  receita: number;
};

/**
 * Estatísticas consumidas pelo dashboard interno (Hermes) via
 * GET /api/hermes/stats. `clientes` e `receita` reaproveitam
 * obterMetricasDashboard("hoje") — não reinventa a lógica de pedidos pagos.
 * O resto vem de site_visits, agregado só na leitura (sem upsert na escrita).
 */
export async function getHermesStats(): Promise<HermesStats> {
  const db = getDb();

  const [metricas, onlineRow, hojeRow, ultimaPorIp, viewsPorIp] = await Promise.all([
    obterMetricasDashboard("hoje"),
    db
      .select({ total: sql<number>`count(distinct ${siteVisits.ip})::int` })
      .from(siteVisits)
      .where(sql`${siteVisits.visitedAt} >= now() - interval '5 minutes'`)
      .then((rows) => rows[0]),
    db
      .select({ total: sql<number>`count(distinct ${siteVisits.ip})::int` })
      .from(siteVisits)
      .where(and(gte(siteVisits.visitedAt, INICIO_HOJE_SP), isNotNull(siteVisits.ip)))
      .then((rows) => rows[0]),
    db
      .selectDistinctOn([siteVisits.ip], {
        ip: siteVisits.ip,
        city: siteVisits.city,
        region: siteVisits.region,
        country: siteVisits.country,
        lastAt: siteVisits.visitedAt,
      })
      .from(siteVisits)
      .where(and(gte(siteVisits.visitedAt, INICIO_HOJE_SP), isNotNull(siteVisits.ip)))
      .orderBy(siteVisits.ip, desc(siteVisits.visitedAt)),
    db
      .select({ ip: siteVisits.ip, views: sql<number>`count(*)::int` })
      .from(siteVisits)
      .where(and(gte(siteVisits.visitedAt, INICIO_HOJE_SP), isNotNull(siteVisits.ip)))
      .groupBy(siteVisits.ip),
  ]);

  const viewsPorIpMap = new Map(viewsPorIp.map((r) => [r.ip as string, r.views]));

  const ipsLista: HermesIpEntry[] = ultimaPorIp
    .filter((r): r is typeof r & { ip: string; lastAt: Date } => Boolean(r.ip && r.lastAt))
    .map((r) => ({
      ip: r.ip,
      ...(r.city ? { city: r.city } : {}),
      ...(r.region ? { region: r.region } : {}),
      ...(r.country ? { country: r.country } : {}),
      views: viewsPorIpMap.get(r.ip) ?? 1,
      lastAt: r.lastAt.toISOString(),
    }))
    .sort((a, b) => (a.lastAt < b.lastAt ? 1 : -1))
    .slice(0, 100);

  return {
    clientes: metricas.pedidosPagos,
    onlineAgora: onlineRow?.total ?? 0,
    visitantesHoje: hojeRow?.total ?? 0,
    ipsHoje: hojeRow?.total ?? 0,
    ipsLista,
    receita: metricas.receitaCentavos / 100,
  };
}
