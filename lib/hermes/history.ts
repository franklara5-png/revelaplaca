import "server-only";

import { and, eq, isNotNull, sql, type SQL } from "drizzle-orm";
import { getDb } from "@/db";
import { pedidos, siteVisits } from "@/db/schema";
import { obterReceitaPorPeriodo } from "@/lib/admin/stats";
import { E_GENTE } from "@/lib/hermes/gente";

export type HermesHistoryEntry = {
  /** "YYYY-MM" no bloco mensal, "YYYY" no anual — sempre America/Sao_Paulo. */
  period: string;
  /** Receita paga em REAIS (centavos / 100). */
  receita: number;
  pedidos: number;
  clientesNovos: number;
  visitantes: number;
};

export type HermesHistory = {
  monthly: HermesHistoryEntry[];
  yearly: HermesHistoryEntry[];
};

// O fuso vai LITERAL dentro da SQL, nunca como parâmetro bound: um placeholder
// aqui muda a expressão a cada linha para o planner e quebra o GROUP BY.
const TZ = sql.raw("'America/Sao_Paulo'");

/** Primeiro instante do mês corrente em SP, como timestamptz. */
const INICIO_JANELA_MESES = sql`((date_trunc('month', now() at time zone ${TZ}) - interval '11 months') at time zone ${TZ})`;

/** Primeiro instante do ano corrente em SP, como timestamptz. */
const INICIO_JANELA_ANOS = sql`((date_trunc('year', now() at time zone ${TZ}) - interval '4 years') at time zone ${TZ})`;

function chaveMes(coluna: SQL) {
  return sql<string>`to_char(date_trunc('month', ${coluna} at time zone ${TZ}), 'YYYY-MM')`;
}

function chaveAno(coluna: SQL) {
  return sql<string>`to_char(date_trunc('year', ${coluna} at time zone ${TZ}), 'YYYY')`;
}

/**
 * Visitantes = IPs (hashes) distintos em `site_visits` por período. Mesma
 * fonte de `visitantesHoje` em getHermesStats, só que agregada por mês/ano.
 *
 * ATENÇÃO ao ler o número: `site_visits` tem expurgo de RETENCAO_DIAS = 90
 * (lib/track/rate-limit.ts). Só os ~3 últimos meses têm dado real; meses e anos
 * anteriores saem 0 porque as linhas não existem mais, não porque ninguém
 * visitou. Linhas antigas com ip_hash nulo (anteriores ao hash) também ficam de
 * fora — mesmo filtro que getHermesStats já aplica.
 *
 * Também passa por E_GENTE (lib/hermes/gente.ts), pelo mesmo motivo de
 * getHermesStats: linha de datacenter já gravada não some sozinha.
 */
async function visitantesPorPeriodo(): Promise<{
  mensal: Map<string, number>;
  anual: Map<string, number>;
}> {
  const db = getDb();
  const coluna = sql`${siteVisits.visitedAt}`;

  const [mensal, anual] = await Promise.all([
    db
      .select({
        period: chaveMes(coluna),
        total: sql<number>`count(distinct ${siteVisits.ipHash})::int`,
      })
      .from(siteVisits)
      .where(
        and(
          isNotNull(siteVisits.ipHash),
          sql`${siteVisits.visitedAt} >= ${INICIO_JANELA_MESES}`,
          E_GENTE,
        ),
      )
      .groupBy(sql`1`),
    db
      .select({
        period: chaveAno(coluna),
        total: sql<number>`count(distinct ${siteVisits.ipHash})::int`,
      })
      .from(siteVisits)
      .where(
        and(
          isNotNull(siteVisits.ipHash),
          sql`${siteVisits.visitedAt} >= ${INICIO_JANELA_ANOS}`,
          E_GENTE,
        ),
      )
      .groupBy(sql`1`),
  ]);

  return {
    mensal: new Map(mensal.map((r) => [r.period, r.total])),
    anual: new Map(anual.map((r) => [r.period, r.total])),
  };
}

/**
 * Cliente novo = e-mail que pagou pela PRIMEIRA vez no período.
 *
 * A fonte é `pedidos`, não a tabela `user` do Better Auth: o login (Google) é
 * opcional e serve só pra consultar "meus pedidos" — quem compra informa placa
 * + e-mail e nunca precisa criar conta. Contar `user` mediria adesão ao login,
 * não clientes. O e-mail é normalizado com lower() pra não duplicar cliente que
 * digitou com caixa diferente.
 */
async function clientesNovosPorPeriodo(): Promise<{
  mensal: Map<string, number>;
  anual: Map<string, number>;
}> {
  const db = getDb();

  // min(pago_em) com fallback pra criado_em: mesmo critério de data que
  // obterReceitaPorPeriodo usa, então receita e clientes caem no mesmo bucket.
  const primeiraCompra = db
    .select({
      primeira:
        sql<string>`min(coalesce(${pedidos.pagoEm}, ${pedidos.criadoEm}))`.as(
          "primeira",
        ),
    })
    .from(pedidos)
    .where(eq(pedidos.status, "pago"))
    .groupBy(sql`lower(${pedidos.email})`)
    .as("primeira_compra");

  const coluna = sql`${primeiraCompra.primeira}`;

  const [mensal, anual] = await Promise.all([
    db
      .select({
        period: chaveMes(coluna),
        total: sql<number>`count(*)::int`,
      })
      .from(primeiraCompra)
      .where(sql`${primeiraCompra.primeira} >= ${INICIO_JANELA_MESES}`)
      .groupBy(sql`1`),
    db
      .select({
        period: chaveAno(coluna),
        total: sql<number>`count(*)::int`,
      })
      .from(primeiraCompra)
      .where(sql`${primeiraCompra.primeira} >= ${INICIO_JANELA_ANOS}`)
      .groupBy(sql`1`),
  ]);

  return {
    mensal: new Map(mensal.map((r) => [r.period, r.total])),
    anual: new Map(anual.map((r) => [r.period, r.total])),
  };
}

/**
 * Histórico mensal (12) e anual (5) consumido pelo dashboard interno (Hermes)
 * via GET /api/hermes/history.
 *
 * Receita e pedidos reaproveitam `obterReceitaPorPeriodo()` sem alterá-la — ela
 * já devolve exatamente os 12 meses / 5 anos, com zeros nos períodos sem
 * movimento; aqui só invertemos para ordem ascendente e convertemos centavos em
 * reais. Este site não tem custo apurado, então o campo `custo` é OMITIDO (o
 * contrato pede omissão, não null).
 */
export async function getHermesHistory(): Promise<HermesHistory> {
  const [receita, visitantes, clientesNovos] = await Promise.all([
    obterReceitaPorPeriodo(),
    visitantesPorPeriodo(),
    clientesNovosPorPeriodo(),
  ]);

  const monthly = receita.porMes
    .map((mes) => ({
      period: mes.chave,
      receita: mes.receitaCentavos / 100,
      pedidos: mes.pedidos,
      clientesNovos: clientesNovos.mensal.get(mes.chave) ?? 0,
      visitantes: visitantes.mensal.get(mes.chave) ?? 0,
    }))
    .reverse();

  const yearly = receita.porAno
    .map((ano) => {
      const period = String(ano.ano);
      return {
        period,
        receita: ano.receitaCentavos / 100,
        pedidos: ano.pedidos,
        clientesNovos: clientesNovos.anual.get(period) ?? 0,
        visitantes: visitantes.anual.get(period) ?? 0,
      };
    })
    .reverse();

  return { monthly, yearly };
}
