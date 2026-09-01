import "server-only";

import { and, asc, desc, eq, gt, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { fipeModelos, veiculos } from "@/db/schema";

export const FIPE_REVALIDATE_SECONDS = 86_400;

export type FipeMarca = {
  slugMarca: string;
  marca: string;
  totalModelos: number;
};

export type FipeModelo = {
  slugModelo: string;
  modelo: string;
  totalAnos: number;
};

export type FipeRegistro = typeof fipeModelos.$inferSelect;

function dbOk() {
  return Boolean(process.env.DATABASE_URL);
}

export async function listarMarcas(): Promise<FipeMarca[]> {
  if (!dbOk()) return [];

  const rows = await getDb()
    .select({
      slugMarca: fipeModelos.slugMarca,
      marca: sql<string>`min(${fipeModelos.marca})`,
      totalModelos: sql<number>`count(distinct ${fipeModelos.slugModelo})::int`,
    })
    .from(fipeModelos)
    .groupBy(fipeModelos.slugMarca)
    .orderBy(asc(sql`min(${fipeModelos.marca})`));

  return rows;
}

export async function buscarMarca(slugMarca: string): Promise<FipeMarca | null> {
  if (!dbOk()) return null;

  const [row] = await getDb()
    .select({
      slugMarca: fipeModelos.slugMarca,
      marca: sql<string>`min(${fipeModelos.marca})`,
      totalModelos: sql<number>`count(distinct ${fipeModelos.slugModelo})::int`,
    })
    .from(fipeModelos)
    .where(eq(fipeModelos.slugMarca, slugMarca))
    .groupBy(fipeModelos.slugMarca);

  return row ?? null;
}

export async function listarModelosPorMarca(
  slugMarca: string,
): Promise<FipeModelo[]> {
  if (!dbOk()) return [];

  return getDb()
    .select({
      slugModelo: fipeModelos.slugModelo,
      modelo: sql<string>`min(${fipeModelos.modelo})`,
      totalAnos: sql<number>`count(*)::int`,
    })
    .from(fipeModelos)
    .where(eq(fipeModelos.slugMarca, slugMarca))
    .groupBy(fipeModelos.slugModelo)
    .orderBy(asc(sql`min(${fipeModelos.modelo})`));
}

export async function buscarModelo(
  slugMarca: string,
  slugModelo: string,
): Promise<{ marca: string; modelo: string } | null> {
  if (!dbOk()) return null;

  const [row] = await getDb()
    .select({
      marca: fipeModelos.marca,
      modelo: fipeModelos.modelo,
    })
    .from(fipeModelos)
    .where(
      and(
        eq(fipeModelos.slugMarca, slugMarca),
        eq(fipeModelos.slugModelo, slugModelo),
      ),
    )
    .limit(1);

  return row ?? null;
}

export async function listarPrecosModelo(
  slugMarca: string,
  slugModelo: string,
): Promise<FipeRegistro[]> {
  if (!dbOk()) return [];

  return getDb()
    .select()
    .from(fipeModelos)
    .where(
      and(
        eq(fipeModelos.slugMarca, slugMarca),
        eq(fipeModelos.slugModelo, slugModelo),
      ),
    )
    .orderBy(desc(fipeModelos.ano));
}

export async function listarPlacasCacheadas(
  offset: number,
  limit: number,
): Promise<Array<{ placa: string; consultadoEm: Date | null }>> {
  if (!dbOk()) return [];

  return getDb()
    .select({
      placa: veiculos.placa,
      consultadoEm: veiculos.consultadoEm,
    })
    .from(veiculos)
    .where(gt(veiculos.expiraEm, new Date()))
    .orderBy(desc(veiculos.consultadoEm))
    .offset(offset)
    .limit(limit);
}

/** A FIPE usa 32000 no lugar do ano para veiculo 0 km. */
export const ANO_ZERO_KM = 32000;

export type EstatisticasModelo = {
  anoNovo: number;
  valorNovo: number;
  anoAntigo: number;
  valorAntigo: number;
  /** Positivo = desvalorizou. Negativo = valorizou (carro de colecao). */
  variacaoPercentual: number;
  /**
   * Taxa anual COMPOSTA, nao a media aritmetica.
   *
   * Dividir a queda total pelos anos da um numero errado e otimista: 84,4% em
   * 15 anos vira "5,6% ao ano", mas um carro perdendo 5,6% ao ano por 15 anos
   * ainda valeria 42% do original — e nao os 15,6% que a tabela mostra. A taxa
   * real nesse caso e 11,6%. Publicar a versao aritmetica em milhares de
   * paginas de preco seria espalhar um numero falso.
   */
  variacaoAnualMedia: number;
  intervaloAnos: number;
  totalAnos: number;
  referencia: string | null;
  temZeroKm: boolean;
};

/**
 * Numeros reais derivados da propria tabela do modelo.
 *
 * Existe para que /tabela-fipe/[marca]/[modelo] tenha conteudo proprio. Sem
 * isto cada uma das ~10 mil paginas de modelo teria como texto unico apenas o
 * nome do modelo mais UMA frase sorteada entre tres — que e exatamente o
 * padrao de conteudo em escala que o Google penaliza, e a penalidade nao fica
 * so nas paginas gerada: atinge o dominio.
 *
 * Tudo aqui e calculado, nada e afirmado sem base na tabela.
 */
export function calcularEstatisticasModelo(
  precos: FipeRegistro[],
): EstatisticasModelo | null {
  // Um valor por ano: o mesmo ano-modelo aparece uma vez por combustivel.
  const porAno = new Map<number, number>();
  let temZeroKm = false;

  for (const p of precos) {
    if (p.ano === ANO_ZERO_KM) {
      temZeroKm = true;
      continue;
    }
    const valor = Number(p.valor);
    if (!Number.isFinite(valor) || valor <= 0) continue;

    const atual = porAno.get(p.ano);
    if (atual === undefined || valor > atual) porAno.set(p.ano, valor);
  }

  // Com um ano so nao ha variacao para medir.
  if (porAno.size < 2) return null;

  const anos = [...porAno.keys()].sort((a, b) => a - b);
  const anoAntigo = anos[0];
  const anoNovo = anos[anos.length - 1];
  const valorAntigo = porAno.get(anoAntigo) as number;
  const valorNovo = porAno.get(anoNovo) as number;

  if (valorNovo <= 0) return null;

  const variacaoPercentual = ((valorNovo - valorAntigo) / valorNovo) * 100;
  const intervaloAnos = anoNovo - anoAntigo;

  // Taxa composta: 1 - (antigo/novo)^(1/anos). Negativa quando o modelo
  // valorizou, o que acontece de verdade em carro de colecao.
  const variacaoAnualMedia =
    intervaloAnos > 0 && valorAntigo > 0
      ? (1 - Math.pow(valorAntigo / valorNovo, 1 / intervaloAnos)) * 100
      : 0;

  return {
    anoNovo,
    valorNovo,
    anoAntigo,
    valorAntigo,
    variacaoPercentual,
    variacaoAnualMedia,
    intervaloAnos,
    totalAnos: porAno.size,
    referencia: precos.find((p) => p.referencia)?.referencia ?? null,
    temZeroKm,
  };
}

export function formatarAnoFipe(ano: number | null | undefined): string {
  if (ano === null || ano === undefined) return "—";
  return ano === ANO_ZERO_KM ? "0 km" : String(ano);
}

export function formatarValorFipe(valor: string | number | null | undefined): string {
  if (valor === null || valor === undefined) return "—";
  const n = typeof valor === "number" ? valor : Number(valor);
  if (!Number.isFinite(n)) return "—";
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function textoVariado(
  seed: string,
  variantes: string[],
  substituicoes: Record<string, string>,
): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash + seed.charCodeAt(i) * (i + 1)) % variantes.length;
  }
  let texto = variantes[hash] ?? variantes[0];
  for (const [chave, valor] of Object.entries(substituicoes)) {
    texto = texto.replaceAll(`{${chave}}`, valor);
  }
  return texto;
}
