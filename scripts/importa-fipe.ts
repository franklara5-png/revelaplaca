/**
 * Importa a Tabela FIPE (carros) para `fipe_modelos`.
 *
 * API: parallelum.com.br v1. A v2 usada antes foi desligada (responde 404) e
 * os nomes de campo mudaram por completo entre as duas versoes.
 *
 * Uso:
 *   npm run import:fipe                        # tudo (demora - ver README)
 *   FIPE_IMPORT_LIMIT=3 npm run import:fipe    # so as 3 primeiras marcas (teste)
 *   FIPE_IMPORT_CONCURRENCY=10 npm run import:fipe
 *   FIPE_IMPORT_RESET=1 npm run import:fipe    # ignora o checkpoint e recomeca
 *
 * O progresso e salvo em .fipe-checkpoint.json a cada marca concluida, entao da
 * para interromper com Ctrl+C e retomar de onde parou.
 */
import "dotenv/config";
import { existsSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { sql } from "drizzle-orm";
import { fipeModelos } from "../db/schema";
import { slugify } from "../lib/slug";

const API_BASE = "https://parallelum.com.br/fipe/api/v1/carros";
const CHECKPOINT = ".fipe-checkpoint.json";

// 6 e o teto pratico: a API v1 comeca a responder 429 acima de ~10 requisicoes
// simultaneas. Medido em 22/08/2026.
const CONCURRENCY = Number(process.env.FIPE_IMPORT_CONCURRENCY ?? 6);
const DELAY_MS = Number(process.env.FIPE_IMPORT_DELAY_MS ?? 0);
const LOTE_INSERT = 200;
const MAX_TENTATIVAS = 4;
const LIMITE_MARCAS = process.env.FIPE_IMPORT_LIMIT
  ? Number(process.env.FIPE_IMPORT_LIMIT)
  : undefined;

// ─── Formatos da API v1 ───────────────────────────────────────────────────────
type MarcaV1 = { codigo: string; nome: string };
type ModeloV1 = { codigo: number; nome: string };
type ModelosRespostaV1 = { modelos: ModeloV1[] };
type AnoV1 = { codigo: string; nome: string };
type DetalheV1 = {
  Valor?: string;
  Marca?: string;
  Modelo?: string;
  AnoModelo?: number;
  Combustivel?: string;
  CodigoFipe?: string;
  MesReferencia?: string;
  SiglaCombustivel?: string;
};

type LinhaFipe = typeof fipeModelos.$inferInsert;

type ErroDefinitivo = Error & { definitivo?: boolean };

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function definitivo(mensagem: string): ErroDefinitivo {
  const erro = new Error(mensagem) as ErroDefinitivo;
  erro.definitivo = true;
  return erro;
}

function parseValor(valor?: string): string | null {
  if (!valor) return null;
  // "R$ 32.430,00" -> "32430"
  const limpo = valor
    .replace(/[^\d,]/g, "")
    .replace(/\./g, "")
    .replace(",", ".");
  const n = Number(limpo);
  return Number.isFinite(n) ? n.toString() : null;
}

/** GET com retry exponencial em 429 e 5xx. 4xx nao repete. */
async function fetchJson<T>(url: string): Promise<T> {
  let ultimoErro: unknown;

  for (let tentativa = 1; tentativa <= MAX_TENTATIVAS; tentativa++) {
    try {
      const res = await fetch(url, {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(20_000),
      });

      if (res.status === 429 || res.status >= 500) {
        throw new Error(`HTTP ${res.status}`);
      }
      if (!res.ok) {
        throw definitivo(`HTTP ${res.status} em ${url}`);
      }

      const json = (await res.json()) as T & { error?: string };
      // A v1 devolve 200 com { error: "..." } em varios casos.
      if (json && typeof json === "object" && "error" in json && json.error) {
        throw definitivo(String(json.error));
      }
      return json;
    } catch (erro) {
      ultimoErro = erro;
      if ((erro as ErroDefinitivo).definitivo) throw erro;
      if (tentativa < MAX_TENTATIVAS) {
        await sleep(500 * 2 ** (tentativa - 1));
      }
    }
  }

  throw ultimoErro;
}

/** Executa `worker` sobre `itens` com no maximo `limite` em paralelo. */
async function emParalelo<T>(
  itens: T[],
  limite: number,
  worker: (item: T) => Promise<void>,
): Promise<void> {
  let cursor = 0;
  const trabalhadores = Array.from(
    { length: Math.max(1, Math.min(limite, itens.length)) },
    async () => {
      while (cursor < itens.length) {
        const item = itens[cursor++];
        await worker(item);
        if (DELAY_MS) await sleep(DELAY_MS);
      }
    },
  );
  await Promise.all(trabalhadores);
}

function lerCheckpoint(): Set<string> {
  if (process.env.FIPE_IMPORT_RESET) return new Set();
  if (!existsSync(CHECKPOINT)) return new Set();
  try {
    return new Set(JSON.parse(readFileSync(CHECKPOINT, "utf8")) as string[]);
  } catch {
    return new Set();
  }
}

function salvarCheckpoint(feitas: Set<string>) {
  writeFileSync(CHECKPOINT, JSON.stringify([...feitas]), "utf8");
}

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL nao configurada");
    process.exit(1);
  }

  const db = drizzle(neon(url));
  const marcas = await fetchJson<MarcaV1[]>(`${API_BASE}/marcas`);
  const marcasAlvo = LIMITE_MARCAS ? marcas.slice(0, LIMITE_MARCAS) : marcas;
  const feitas = lerCheckpoint();
  const pendentes = marcasAlvo.filter((m) => !feitas.has(m.codigo));

  console.info(
    `FIPE v1 - ${pendentes.length} marcas pendentes de ${marcasAlvo.length}` +
      ` - concorrencia ${CONCURRENCY}` +
      (feitas.size ? ` - ${feitas.size} ja concluidas (checkpoint)` : ""),
  );

  let inseridos = 0;
  let erros = 0;
  let buffer: LinhaFipe[] = [];

  /** Grava em lote para nao fazer um round-trip por linha. */
  async function descarregar(forcar = false) {
    if (buffer.length === 0) return;
    if (!forcar && buffer.length < LOTE_INSERT) return;

    const lote = buffer;
    buffer = [];

    try {
      await db
        .insert(fipeModelos)
        .values(lote)
        .onConflictDoUpdate({
          target: [fipeModelos.codigo, fipeModelos.ano, fipeModelos.combustivel],
          set: {
            marca: sql`excluded.marca`,
            modelo: sql`excluded.modelo`,
            valor: sql`excluded.valor`,
            referencia: sql`excluded.referencia`,
            slugMarca: sql`excluded.slug_marca`,
            slugModelo: sql`excluded.slug_modelo`,
          },
        });
      inseridos += lote.length;
      console.info(`  ${inseridos} registros gravados...`);
    } catch (erro) {
      erros += lote.length;
      console.warn(`  falha ao gravar lote: ${(erro as Error).message}`);
    }
  }

  for (const marca of pendentes) {
    let modelos: ModeloV1[];
    try {
      const resposta = await fetchJson<ModelosRespostaV1>(
        `${API_BASE}/marcas/${marca.codigo}/modelos`,
      );
      modelos = resposta.modelos ?? [];
    } catch (erro) {
      console.warn(`x ${marca.nome}: ${(erro as Error).message}`);
      erros++;
      continue;
    }

    // Contado por marca: so entra no checkpoint a marca importada inteira.
    // Sem isto, um 429 no meio deixaria buracos e o checkpoint impediria o
    // retry na proxima execucao.
    let errosDaMarca = 0;

    await emParalelo(modelos, CONCURRENCY, async (modelo) => {
      let anos: AnoV1[];
      try {
        anos = await fetchJson<AnoV1[]>(
          `${API_BASE}/marcas/${marca.codigo}/modelos/${modelo.codigo}/anos`,
        );
      } catch {
        errosDaMarca++;
        return;
      }

      await emParalelo(anos, CONCURRENCY, async (ano) => {
        try {
          const d = await fetchJson<DetalheV1>(
            `${API_BASE}/marcas/${marca.codigo}/modelos/${modelo.codigo}/anos/${ano.codigo}`,
          );

          const nomeMarca = d.Marca ?? marca.nome;
          const nomeModelo = d.Modelo ?? modelo.nome;
          const anoNum =
            d.AnoModelo ?? Number.parseInt(ano.codigo.split("-")[0] ?? "", 10);

          if (!Number.isFinite(anoNum)) {
            errosDaMarca++;
            return;
          }

          // Sem CodigoFipe, marca+modelo entram na chave para nao colidir
          // com outro modelo que tambem esteja sem codigo.
          const codigo =
            d.CodigoFipe ?? `${marca.codigo}-${modelo.codigo}`;

          buffer.push({
            codigo,
            marca: nomeMarca,
            modelo: nomeModelo,
            ano: anoNum,
            combustivel:
              d.Combustivel ?? ano.nome.replace(/^\d+\s*/, "").trim() ?? "",
            valor: parseValor(d.Valor),
            referencia: d.MesReferencia ?? null,
            slugMarca: slugify(nomeMarca),
            slugModelo: slugify(nomeModelo),
          });

          await descarregar();
        } catch {
          errosDaMarca++;
        }
      });
    });

    await descarregar(true);
    erros += errosDaMarca;

    if (errosDaMarca === 0) {
      feitas.add(marca.codigo);
      salvarCheckpoint(feitas);
      console.info(`ok ${marca.nome} (${modelos.length} modelos)`);
    } else {
      console.warn(
        `! ${marca.nome}: ${errosDaMarca} falhas — nao marcada como concluida,` +
          ` sera refeita na proxima execucao` +
          (errosDaMarca > 10
            ? ". Muitos erros costumam ser HTTP 429: baixe FIPE_IMPORT_CONCURRENCY."
            : ""),
      );
    }
  }

  await descarregar(true);

  console.info(`\nConcluido: ${inseridos} registros, ${erros} erros.`);
  if (erros === 0 && existsSync(CHECKPOINT)) {
    unlinkSync(CHECKPOINT);
    console.info("Checkpoint removido (importacao completa).");
  }
}

main().catch((erro) => {
  const msg = (erro as Error)?.message ?? String(erro);

  if (msg.includes("429")) {
    console.error(
      "\nA API da FIPE esta limitando as requisicoes (HTTP 429).\n" +
        "Espere alguns minutos e rode de novo — o checkpoint retoma de onde parou.\n" +
        "Se persistir, baixe a concorrencia: FIPE_IMPORT_CONCURRENCY=3 npm run import:fipe",
    );
  } else {
    console.error(erro);
  }

  process.exit(1);
});
