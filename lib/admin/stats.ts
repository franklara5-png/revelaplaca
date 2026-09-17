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

const MESES_PT = [
  "jan",
  "fev",
  "mar",
  "abr",
  "mai",
  "jun",
  "jul",
  "ago",
  "set",
  "out",
  "nov",
  "dez",
];

function anoMesAtualSP(): { ano: number; mes: number } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
  }).formatToParts(new Date());
  return {
    ano: Number(parts.find((p) => p.type === "year")!.value),
    mes: Number(parts.find((p) => p.type === "month")!.value),
  };
}

function chaveAnoMesSP(data: Date): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
  }).formatToParts(data);
  const ano = parts.find((p) => p.type === "year")!.value;
  const mes = parts.find((p) => p.type === "month")!.value;
  return `${ano}-${mes}`;
}

function anoSP(data: Date): number {
  return Number(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Sao_Paulo",
      year: "numeric",
    }).format(data),
  );
}

export type ReceitaMes = {
  chave: string;
  label: string;
  pedidos: number;
  receitaCentavos: number;
  ticketMedioCentavos: number;
};

export type ReceitaAno = {
  ano: number;
  pedidos: number;
  receitaCentavos: number;
  ticketMedioCentavos: number;
};

/**
 * Receita paga agrupada por mês (últimos 12) e por ano (últimos 5), em
 * America/Sao_Paulo. Reaproveita `pedidos.valorCentavos` com status='pago' —
 * mesma fonte de `obterMetricasDashboard`, sem tabela/paralela nova.
 */
export async function obterReceitaPorPeriodo(): Promise<{
  porMes: ReceitaMes[];
  porAno: ReceitaAno[];
}> {
  const db = getDb();

  const linhasMes = await db
    .select({
      periodoInicio: sql<string>`(date_trunc('month', coalesce(${pedidos.pagoEm}, ${pedidos.criadoEm}) at time zone 'America/Sao_Paulo') at time zone 'America/Sao_Paulo')`,
      pedidos: sql<number>`count(*)::int`,
      receitaCentavos: sql<number>`coalesce(sum(${pedidos.valorCentavos}), 0)::int`,
    })
    .from(pedidos)
    .where(
      and(
        eq(pedidos.status, "pago"),
        sql`coalesce(${pedidos.pagoEm}, ${pedidos.criadoEm}) >= (date_trunc('month', now() at time zone 'America/Sao_Paulo') at time zone 'America/Sao_Paulo' - interval '11 months')`,
      ),
    )
    .groupBy(sql`1`)
    .orderBy(sql`1 desc`);

  const linhasAno = await db
    .select({
      periodoInicio: sql<string>`(date_trunc('year', coalesce(${pedidos.pagoEm}, ${pedidos.criadoEm}) at time zone 'America/Sao_Paulo') at time zone 'America/Sao_Paulo')`,
      pedidos: sql<number>`count(*)::int`,
      receitaCentavos: sql<number>`coalesce(sum(${pedidos.valorCentavos}), 0)::int`,
    })
    .from(pedidos)
    .where(
      and(
        eq(pedidos.status, "pago"),
        sql`coalesce(${pedidos.pagoEm}, ${pedidos.criadoEm}) >= (date_trunc('year', now() at time zone 'America/Sao_Paulo') at time zone 'America/Sao_Paulo' - interval '4 years')`,
      ),
    )
    .groupBy(sql`1`)
    .orderBy(sql`1 desc`);

  const mapMes = new Map(
    linhasMes.map((r) => [
      chaveAnoMesSP(new Date(r.periodoInicio)),
      { pedidos: r.pedidos, receitaCentavos: r.receitaCentavos },
    ]),
  );

  const mapAno = new Map(
    linhasAno.map((r) => [
      anoSP(new Date(r.periodoInicio)),
      { pedidos: r.pedidos, receitaCentavos: r.receitaCentavos },
    ]),
  );

  const { ano: anoAtual, mes: mesAtual } = anoMesAtualSP();

  const porMes: ReceitaMes[] = [];
  for (let i = 0; i < 12; i++) {
    let mes = mesAtual - i;
    let ano = anoAtual;
    while (mes < 1) {
      mes += 12;
      ano -= 1;
    }
    const chave = `${ano}-${String(mes).padStart(2, "0")}`;
    const dado = mapMes.get(chave);
    const pedidosCount = dado?.pedidos ?? 0;
    const receitaCentavos = dado?.receitaCentavos ?? 0;
    porMes.push({
      chave,
      label: `${MESES_PT[mes - 1]}/${String(ano).slice(2)}`,
      pedidos: pedidosCount,
      receitaCentavos,
      ticketMedioCentavos:
        pedidosCount > 0 ? Math.round(receitaCentavos / pedidosCount) : 0,
    });
  }

  const porAno: ReceitaAno[] = [];
  for (let i = 0; i < 5; i++) {
    const ano = anoAtual - i;
    const dado = mapAno.get(ano);
    const pedidosCount = dado?.pedidos ?? 0;
    const receitaCentavos = dado?.receitaCentavos ?? 0;
    porAno.push({
      ano,
      pedidos: pedidosCount,
      receitaCentavos,
      ticketMedioCentavos:
        pedidosCount > 0 ? Math.round(receitaCentavos / pedidosCount) : 0,
    });
  }

  // porMes/porAno saem com o mais recente primeiro (uso direto nas tabelas);
  // quem for desenhar gráfico cronológico deve inverter a ordem.
  return { porMes, porAno };
}

/**
 * Carência entre marcar o pedido como pago e ele ter o relatório gravado.
 *
 * De onde saiu o número (13/09/2026): o fluxo é SÍNCRONO — o mesmo webhook
 * Asaas que grava `pedidos.status='pago'` chama em seguida
 * `gerarRelatorioParaPedido`, que consulta o fornecedor premium com retry
 * (`consultarComBackoff`, 3 tentativas com backoff de 0/2/4s) e cada tentativa
 * tem timeout de 15s (2 chamadas internas cada). Pior caso medido no código:
 * ~96s entre `pagoEm` e o INSERT em `relatorios`. 15 minutos dá ~9x de folga
 * e só conta como pendência o pedido cujo processamento DE FATO falhou/timeout
 * — nunca um pagamento ainda em andamento.
 */
export const CARENCIA_PAGOS_SEM_RELATORIO_MIN = 15;

/**
 * Query (sem executar) que conta pedidos pagos sem relatorio. Separada da
 * execucao so para permitir teste de unidade do SQL gerado via `.toSQL()`,
 * sem tocar no Neon de producao.
 */
export function queryPagosSemRelatorio(db: ReturnType<typeof getDb>) {
  return db
    .select({ total: sql<number>`count(*)::int` })
    .from(pedidos)
    .leftJoin(relatorios, eq(relatorios.pedidoId, pedidos.id))
    .where(
      and(
        eq(pedidos.status, "pago"),
        sql`${relatorios.id} is null`,
        sql`${pedidos.pagoEm} is not null`,
        // NÃO escrever `interval '${N} minutes'`: o valor interpolado vira
        // parâmetro ($2) e o Postgres não substitui parâmetro DENTRO de string
        // literal — ele lê o dígito do índice. `interval '$2 minutes'` virava
        // 2 minutos em vez de 15, e mudaria sozinho se a ordem dos parâmetros
        // mudasse. Multiplicar por `interval '1 minute'` mantém o número como
        // parâmetro de verdade, fora das aspas.
        sql`${pedidos.pagoEm} <= now() - (${CARENCIA_PAGOS_SEM_RELATORIO_MIN} * interval '1 minute')`,
      ),
    );
}

/**
 * Conta pedidos pagos que ainda nao geraram relatorio — o cliente pagou e
 * ainda nao recebeu o resultado. `db` e injetavel para permitir teste de
 * unidade sem tocar no Neon de producao; em producao usa `getDb()`.
 */
export async function contarPagosSemRelatorio(
  db: ReturnType<typeof getDb> = getDb(),
): Promise<number> {
  const [row] = await queryPagosSemRelatorio(db);
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
