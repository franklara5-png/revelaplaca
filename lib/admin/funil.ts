import "server-only";

import { and, gte, inArray, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { eventos } from "@/db/schema";
import { EVENTOS_FUNIL } from "@/lib/eventos-constants";
import { inicioDoPeriodo, type PeriodoAdmin } from "./periodo";

export type EtapaFunil = {
  nome: string;
  label: string;
  total: number;
  taxaAnterior: number | null;
};

const LABELS: Record<string, string> = {
  consulta_gratis: "Consulta grátis",
  cta_relatorio_click: "CTA relatório",
  checkout_view: "Checkout",
  pix_gerado: "Pix gerado",
  cartao_click: "Cartão",
  pagamento_confirmado: "Pago",
};

export async function obterFunilConversao(periodo: PeriodoAdmin): Promise<EtapaFunil[]> {
  const desde = inicioDoPeriodo(periodo);

  const rows = await getDb()
    .select({
      nome: eventos.nome,
      total: sql<number>`count(*)::int`,
    })
    .from(eventos)
    .where(
      and(
        inArray(eventos.nome, [...EVENTOS_FUNIL]),
        gte(eventos.criadoEm, desde),
      ),
    )
    .groupBy(eventos.nome);

  const mapa = new Map(rows.map((r) => [r.nome, r.total]));

  let anterior: number | null = null;

  return EVENTOS_FUNIL.map((nome) => {
    const total = mapa.get(nome) ?? 0;
    const taxaAnterior =
      anterior !== null && anterior > 0
        ? Math.round((total / anterior) * 1000) / 10
        : null;
    anterior = total;

    return {
      nome,
      label: LABELS[nome] ?? nome,
      total,
      taxaAnterior,
    };
  });
}
