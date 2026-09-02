import "server-only";

import { and, desc, gte, isNotNull, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { siteVisits } from "@/db/schema";
import { obterMetricasDashboard } from "@/lib/admin/stats";
import { E_GENTE } from "@/lib/hermes/gente";

// Início do dia de hoje em America/Sao_Paulo, como timestamptz — calculado no
// banco (não no processo Node, que na Vercel roda em UTC) para bater com o
// fuso do negócio independente de onde a função executa.
const INICIO_HOJE_SP = sql`(date_trunc('day', now() at time zone 'America/Sao_Paulo') at time zone 'America/Sao_Paulo')`;

export type HermesIpEntry = {
  /** sha256 do IP com salt. Nunca o endereco. */
  ipHash: string;
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
 *
 * Toda consulta a site_visits passa por E_GENTE (lib/hermes/gente.ts): a
 * detecção da escrita envelhece, e sem reavaliar na leitura o card "IPs do dia"
 * volta a listar varredor de datacenter que já está gravado.
 */
export async function getHermesStats(): Promise<HermesStats> {
  const db = getDb();

  const [metricas, onlineRow, hojeRow, ultimaPorIp, viewsPorIp] = await Promise.all([
    obterMetricasDashboard("hoje"),
    db
      .select({ total: sql<number>`count(distinct ${siteVisits.ipHash})::int` })
      .from(siteVisits)
      .where(
        and(sql`${siteVisits.visitedAt} >= now() - interval '5 minutes'`, E_GENTE),
      )
      .then((rows) => rows[0]),
    db
      .select({ total: sql<number>`count(distinct ${siteVisits.ipHash})::int` })
      .from(siteVisits)
      .where(
        and(
          gte(siteVisits.visitedAt, INICIO_HOJE_SP),
          isNotNull(siteVisits.ipHash),
          E_GENTE,
        ),
      )
      .then((rows) => rows[0]),
    db
      .selectDistinctOn([siteVisits.ipHash], {
        ipHash: siteVisits.ipHash,
        city: siteVisits.city,
        region: siteVisits.region,
        country: siteVisits.country,
        lastAt: siteVisits.visitedAt,
      })
      .from(siteVisits)
      .where(
        and(
          gte(siteVisits.visitedAt, INICIO_HOJE_SP),
          isNotNull(siteVisits.ipHash),
          E_GENTE,
        ),
      )
      .orderBy(siteVisits.ipHash, desc(siteVisits.visitedAt)),
    db
      .select({ ipHash: siteVisits.ipHash, views: sql<number>`count(*)::int` })
      .from(siteVisits)
      .where(
        and(
          gte(siteVisits.visitedAt, INICIO_HOJE_SP),
          isNotNull(siteVisits.ipHash),
          E_GENTE,
        ),
      )
      .groupBy(siteVisits.ipHash),
  ]);

  const viewsPorIpMap = new Map(
    viewsPorIp.map((r) => [r.ipHash as string, r.views]),
  );

  const ipsLista: HermesIpEntry[] = ultimaPorIp
    .filter(
      (r): r is typeof r & { ipHash: string; lastAt: Date } =>
        Boolean(r.ipHash && r.lastAt),
    )
    .map((r) => ({
      ipHash: r.ipHash,
      ...(r.city ? { city: r.city } : {}),
      ...(r.region ? { region: r.region } : {}),
      ...(r.country ? { country: r.country } : {}),
      views: viewsPorIpMap.get(r.ipHash) ?? 1,
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
