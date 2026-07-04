import "server-only";

import { and, count, desc, eq, gte, ilike, or, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { consultas, pedidos, relatorios } from "@/db/schema";
import { diasGrafico, inicioDoPeriodo, type PeriodoAdmin } from "./periodo";

export async function obterMetricasDashboard(periodo: PeriodoAdmin) {
  const db = getDb();
  const desde = inicioDoPeriodo(periodo);

  const [receitaRow] = await db
    .select({
      total: sql<number>`coalesce(sum(${pedidos.valorCentavos}), 0)::int`,
      quantidade: sql<number>`count(*)::int`,
    })
    .from(pedidos)
    .where(and(eq(pedidos.status, "pago"), gte(pedidos.pagoEm, desde)));

  const [consultasRow] = await db
    .select({ total: sql<number>`count(*)::int` })
    .from(consultas)
    .where(gte(consultas.criadaEm, desde));

  const [cacheRow] = await db
    .select({
      hits: sql<number>`coalesce(sum(case when ${consultas.cacheHit} then 1 else 0 end), 0)::int`,
      total: sql<number>`count(*)::int`,
    })
    .from(consultas)
    .where(gte(consultas.criadaEm, desde));

  const [pendentesRow] = await db
    .select({ total: sql<number>`count(*)::int` })
    .from(pedidos)
    .where(eq(pedidos.status, "pendente"));

  const [expiradosRow] = await db
    .select({ total: sql<number>`count(*)::int` })
    .from(pedidos)
    .where(
      and(
        eq(pedidos.status, "pendente"),
        sql`${pedidos.criadoEm} < now() - interval '24 hours'`,
      ),
    );

  const pagos = receitaRow?.quantidade ?? 0;
  const consultasTotal = consultasRow?.total ?? 0;
  const receitaCentavos = receitaRow?.total ?? 0;
  const cacheHits = cacheRow?.hits ?? 0;
  const cacheTotal = cacheRow?.total ?? 0;

  return {
    receitaCentavos,
    pedidosPagos: pagos,
    consultasGratis: consultasTotal,
    taxaConversao: consultasTotal > 0 ? (pagos / consultasTotal) * 100 : 0,
    taxaCacheHit: cacheTotal > 0 ? (cacheHits / cacheTotal) * 100 : 0,
    ticketMedioCentavos: pagos > 0 ? Math.round(receitaCentavos / pagos) : 0,
    pedidosPendentes: pendentesRow?.total ?? 0,
    pedidosExpirados: expiradosRow?.total ?? 0,
  };
}

export async function obterGrafico14Dias() {
  const db = getDb();
  const dias = diasGrafico();
  const inicio = dias[0]!;

  const consultasPorDia = await db
    .select({
      dia: sql<string>`date_trunc('day', ${consultas.criadaEm})::date`,
      total: sql<number>`count(*)::int`,
    })
    .from(consultas)
    .where(gte(consultas.criadaEm, inicio))
    .groupBy(sql`date_trunc('day', ${consultas.criadaEm})::date`);

  const vendasPorDia = await db
    .select({
      dia: sql<string>`date_trunc('day', ${pedidos.pagoEm})::date`,
      total: sql<number>`count(*)::int`,
    })
    .from(pedidos)
    .where(and(eq(pedidos.status, "pago"), gte(pedidos.pagoEm, inicio)))
    .groupBy(sql`date_trunc('day', ${pedidos.pagoEm})::date`);

  const mapConsultas = new Map(consultasPorDia.map((r) => [r.dia, r.total]));
  const mapVendas = new Map(vendasPorDia.map((r) => [r.dia, r.total]));

  return dias.map((d) => {
    const chave = d.toISOString().slice(0, 10);
    return {
      data: d,
      consultas: mapConsultas.get(chave) ?? 0,
      vendas: mapVendas.get(chave) ?? 0,
    };
  });
}

export async function contarPagosSemRelatorio(): Promise<number> {
  const db = getDb();
  const [row] = await db
    .select({ total: sql<number>`count(*)::int` })
    .from(pedidos)
    .leftJoin(relatorios, eq(relatorios.pedidoId, pedidos.id))
    .where(and(eq(pedidos.status, "pago"), sql`${relatorios.id} is null`));

  return row?.total ?? 0;
}

export async function listarPedidosAdmin(input: {
  pagina: number;
  porPagina: number;
  status?: string;
  busca?: string;
}) {
  const db = getDb();
  const offset = (input.pagina - 1) * input.porPagina;
  const condicoes = [];

  if (input.status) {
    condicoes.push(eq(pedidos.status, input.status));
  }

  if (input.busca) {
    const termo = `%${input.busca}%`;
    condicoes.push(
      or(ilike(pedidos.placa, termo), ilike(pedidos.email, termo))!,
    );
  }

  const where = condicoes.length > 0 ? and(...condicoes) : undefined;

  const [totalRow] = await db
    .select({ total: count() })
    .from(pedidos)
    .where(where);

  const rows = await db
    .select()
    .from(pedidos)
    .where(where)
    .orderBy(desc(pedidos.criadoEm))
    .limit(input.porPagina)
    .offset(offset);

  return { pedidos: rows, total: totalRow?.total ?? 0 };
}

export async function listarConsultasRecentes(limite = 50) {
  return getDb()
    .select()
    .from(consultas)
    .orderBy(desc(consultas.criadaEm))
    .limit(limite);
}

export async function topPlacasConsultadas(dias = 30, limite = 10) {
  const desde = new Date(Date.now() - dias * 24 * 60 * 60 * 1000);
  return getDb()
    .select({
      placa: consultas.placa,
      total: sql<number>`count(*)::int`,
    })
    .from(consultas)
    .where(gte(consultas.criadaEm, desde))
    .groupBy(consultas.placa)
    .orderBy(sql`count(*) desc`)
    .limit(limite);
}

export async function topOrigensConsultas(dias = 30, limite = 10) {
  const desde = new Date(Date.now() - dias * 24 * 60 * 60 * 1000);
  return getDb()
    .select({
      origem: consultas.origem,
      total: sql<number>`count(*)::int`,
    })
    .from(consultas)
    .where(gte(consultas.criadaEm, desde))
    .groupBy(consultas.origem)
    .orderBy(sql`count(*) desc`)
    .limit(limite);
}
