import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { fipeModelos } from "../db/schema";
import { slugify } from "../lib/slug";

const API_BASE = "https://parallelum.com.br/fipe/api/v2/carros";
const DELAY_MS = Number(process.env.FIPE_IMPORT_DELAY_MS ?? 350);
const LIMITE_MARCAS = process.env.FIPE_IMPORT_LIMIT
  ? Number(process.env.FIPE_IMPORT_LIMIT)
  : undefined;

type Marca = { code: string; name: string };
type Modelo = { code: string; name: string };
type Ano = { code: string; name: string };
type VeiculoFipe = {
  codigoFipe?: string;
  marca?: string;
  modelo?: string;
  anoModelo?: number;
  combustivel?: string;
  valor?: string;
  mesReferencia?: string;
};

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function parseValor(valor?: string): number | null {
  if (!valor) return null;
  const limpo = valor
    .replace(/[^\d,]/g, "")
    .replace(",", ".");
  const n = Number(limpo);
  return Number.isFinite(n) ? n : null;
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} em ${url}`);
  return res.json() as Promise<T>;
}

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL não configurada");
    process.exit(1);
  }

  const db = drizzle(neon(url));
  const marcas = await fetchJson<Marca[]>(`${API_BASE}/marcas`);
  const marcasAlvo = LIMITE_MARCAS ? marcas.slice(0, LIMITE_MARCAS) : marcas;

  console.info(
    `Importando FIPE: ${marcasAlvo.length} marcas (delay ${DELAY_MS}ms)…`,
  );

  let inseridos = 0;
  let erros = 0;

  for (const marca of marcasAlvo) {
    await sleep(DELAY_MS);

    let modelos: Modelo[];
    try {
      modelos = await fetchJson<Modelo[]>(
        `${API_BASE}/marcas/${marca.code}/modelos`,
      );
    } catch (erro) {
      console.warn(`Modelos ${marca.name}:`, erro);
      erros++;
      continue;
    }

    for (const modelo of modelos) {
      await sleep(DELAY_MS);

      let anos: Ano[];
      try {
        anos = await fetchJson<Ano[]>(
          `${API_BASE}/marcas/${marca.code}/modelos/${modelo.code}/anos`,
        );
      } catch {
        erros++;
        continue;
      }

      for (const ano of anos) {
        await sleep(DELAY_MS);

        try {
          const detalhe = await fetchJson<VeiculoFipe>(
            `${API_BASE}/marcas/${marca.code}/modelos/${modelo.code}/anos/${ano.code}`,
          );

          const codigo =
            detalhe.codigoFipe ??
            `${marca.code}-${modelo.code}-${ano.code}`;

          await db
            .insert(fipeModelos)
            .values({
              codigo,
              marca: detalhe.marca ?? marca.name,
              modelo: detalhe.modelo ?? modelo.name,
              ano: detalhe.anoModelo ?? Number(ano.name.slice(0, 4)) ?? 0,
              combustivel: detalhe.combustivel ?? ano.name,
              valor: parseValor(detalhe.valor)?.toString() ?? null,
              referencia: detalhe.mesReferencia ?? null,
              slugMarca: slugify(detalhe.marca ?? marca.name),
              slugModelo: slugify(detalhe.modelo ?? modelo.name),
            })
            .onConflictDoUpdate({
              target: fipeModelos.codigo,
              set: {
                valor: parseValor(detalhe.valor)?.toString() ?? null,
                referencia: detalhe.mesReferencia ?? null,
              },
            });

          inseridos++;
          if (inseridos % 100 === 0) {
            console.info(`  ${inseridos} registros…`);
          }
        } catch {
          erros++;
        }
      }
    }

    console.info(`✓ ${marca.name} (${modelos.length} modelos)`);
  }

  console.info(`Concluído: ${inseridos} registros, ${erros} erros.`);
}

main().catch((erro) => {
  console.error(erro);
  process.exit(1);
});
