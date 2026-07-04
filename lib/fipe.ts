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
