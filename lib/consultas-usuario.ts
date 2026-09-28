import "server-only";

import { desc, eq, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { consultas, veiculos } from "@/db/schema";

/**
 * Placas que o usuario consultou, uma linha por placa.
 *
 * Agrupado de proposito: consultar a mesma placa tres vezes e uma placa na
 * lista, nao tres. O join com veiculos e leftJoin porque a consulta pode ter
 * sido registrada e o fornecedor ter falhado logo depois — nesse caso a placa
 * aparece sem marca/modelo, que e melhor que sumir da lista.
 */
export async function getConsultasDoUsuario(userId: string, limite = 20) {
  const db = getDb();

  return db
    .select({
      placa: consultas.placa,
      ultimaEm: sql<string>`max(${consultas.criadaEm})`,
      vezes: sql<number>`count(*)::int`,
      marca: veiculos.marca,
      modelo: veiculos.modelo,
      anoModelo: veiculos.anoModelo,
    })
    .from(consultas)
    .leftJoin(veiculos, eq(veiculos.placa, consultas.placa))
    .where(eq(consultas.userId, userId))
    .groupBy(
      consultas.placa,
      veiculos.marca,
      veiculos.modelo,
      veiculos.anoModelo,
    )
    .orderBy(desc(sql`max(${consultas.criadaEm})`))
    .limit(limite);
}
