/**
 * Núcleo do import da Tabela FIPE (parallelum.com.br v1), compartilhado entre
 * o script de linha de comando (scripts/importa-fipe.ts) e o cron de resumo
 * automático (app/api/cron/importa-fipe/route.ts).
 *
 * A API v1 tem COTA DIARIA, nao so limite de rajada: ao estourar, ela responde
 * 429 com Retry-After na casa das ~24h (medido: 86017s em 31/08/2026). Por
 * isso o import e feito aos pedacos, com checkpoint por marca — cada chamador
 * decide onde guardar esse checkpoint (arquivo local no CLI, tabela no cron).
 */
import type { NeonHttpDatabase } from "drizzle-orm/neon-http";
import { sql } from "drizzle-orm";
import { fipeModelos } from "@/db/schema";
import { slugify } from "@/lib/slug";

// `any` no generic: script CLI usa `drizzle(neon(url))` sem schema, a rota de
// cron usa `getDb()` com schema tipado — os dois precisam caber aqui.
type AnyNeonDb = NeonHttpDatabase<any>;

export const API_BASE = "https://parallelum.com.br/fipe/api/v1/carros";
export const LOTE_INSERT_PADRAO = 200;
export const MAX_TENTATIVAS = 4;

export type MarcaV1 = { codigo: string; nome: string };
export type ModeloV1 = { codigo: number; nome: string };
export type ModelosRespostaV1 = { modelos: ModeloV1[] };
export type AnoV1 = { codigo: string; nome: string };
export type DetalheV1 = {
  Valor?: string;
  Marca?: string;
  Modelo?: string;
  AnoModelo?: number;
  Combustivel?: string;
  CodigoFipe?: string;
  MesReferencia?: string;
  SiglaCombustivel?: string;
};

export type LinhaFipe = typeof fipeModelos.$inferInsert;

type ErroDefinitivo = Error & { definitivo?: boolean };

export class CotaEsgotada extends Error {
  constructor(public readonly segundos: number) {
    super(`cota diaria da API esgotada; liberar em ~${Math.ceil(segundos / 3600)}h`);
    this.name = "CotaEsgotada";
  }
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function definitivo(mensagem: string): ErroDefinitivo {
  const erro = new Error(mensagem) as ErroDefinitivo;
  erro.definitivo = true;
  return erro;
}

export function parseValor(valor?: string): string | null {
  if (!valor) return null;
  // "R$ 32.430,00" -> "32430"
  const limpo = valor
    .replace(/[^\d,]/g, "")
    .replace(/\./g, "")
    .replace(",", ".");
  const n = Number(limpo);
  return Number.isFinite(n) ? n.toString() : null;
}

/**
 * Estado da cota, isolado por instancia (nao module-level) — cada chamador
 * (script CLI, invocacao de cron) roda em seu proprio processo e não deve
 * compartilhar esse estado entre execucoes.
 */
export function criarEstadoCota() {
  return { esgotadaEm: null as number | null };
}
type EstadoCota = ReturnType<typeof criarEstadoCota>;

/** GET com retry exponencial em 429 e 5xx. 4xx nao repete. */
export async function fetchJson<T>(url: string, cota: EstadoCota): Promise<T> {
  let ultimoErro: unknown;

  for (let tentativa = 1; tentativa <= MAX_TENTATIVAS; tentativa++) {
    if (cota.esgotadaEm !== null) throw new CotaEsgotada(cota.esgotadaEm);

    try {
      const res = await fetch(url, {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(20_000),
      });

      if (res.status === 429) {
        const espera = Number(res.headers.get("retry-after") ?? 0);
        // Retry-After curto e rajada, da para esperar. Longo e cota do dia:
        // insistir so queima tentativa e atrasa o diagnostico.
        if (espera > 300) {
          cota.esgotadaEm = espera;
          throw new CotaEsgotada(espera);
        }
        throw new Error("HTTP 429");
      }

      if (res.status >= 500) {
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
      if (erro instanceof CotaEsgotada) throw erro;
      if ((erro as ErroDefinitivo).definitivo) throw erro;
      if (tentativa < MAX_TENTATIVAS) {
        // Backoff mais generoso: 2s, 6s, 18s. O anterior somava ~3,5s, curto
        // demais para a janela de rajada desta API.
        await sleep(2000 * 3 ** (tentativa - 1));
      }
    }
  }

  throw ultimoErro;
}

/** Executa `worker` sobre `itens` com no maximo `limite` em paralelo. */
export async function emParalelo<T>(
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
      }
    },
  );
  await Promise.all(trabalhadores);
}

export function buscarMarcas(cota: EstadoCota) {
  return fetchJson<MarcaV1[]>(`${API_BASE}/marcas`, cota);
}

/** Grava um lote em `fipe_modelos`, atualizando em conflito de PK. */
export async function salvarLote(
  db: AnyNeonDb,
  lote: LinhaFipe[],
): Promise<void> {
  if (lote.length === 0) return;
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
}

export type ResultadoMarca = {
  modelos: number;
  inseridos: number;
  erros: number;
  cotaEsgotada: boolean;
};

/**
 * Importa uma marca inteira (todos os modelos, todos os anos) e grava em
 * lotes. Nao lanca CotaEsgotada — sinaliza via `cotaEsgotada: true` no
 * retorno, pra quem chama decidir se para o loop de marcas ali ou depois.
 */
export async function importarMarca(
  db: AnyNeonDb,
  marca: MarcaV1,
  cota: EstadoCota,
  opts: { concorrencia: number; loteInsert?: number } = { concorrencia: 6 },
): Promise<ResultadoMarca> {
  const loteInsert = opts.loteInsert ?? LOTE_INSERT_PADRAO;
  let buffer: LinhaFipe[] = [];
  let inseridos = 0;
  let erros = 0;
  let cotaEsgotada = false;

  async function descarregar(forcar = false) {
    if (buffer.length === 0) return;
    if (!forcar && buffer.length < loteInsert) return;
    const lote = buffer;
    buffer = [];
    try {
      await salvarLote(db, lote);
      inseridos += lote.length;
    } catch {
      erros += lote.length;
    }
  }

  let modelos: ModeloV1[];
  try {
    const resposta = await fetchJson<ModelosRespostaV1>(
      `${API_BASE}/marcas/${marca.codigo}/modelos`,
      cota,
    );
    modelos = resposta.modelos ?? [];
  } catch (erro) {
    if (erro instanceof CotaEsgotada) {
      return { modelos: 0, inseridos: 0, erros: 0, cotaEsgotada: true };
    }
    return { modelos: 0, inseridos: 0, erros: 1, cotaEsgotada: false };
  }

  await emParalelo(modelos, opts.concorrencia, async (modelo) => {
    // Cota ja esgotada por outra tarefa paralela: nao vale a pena tentar de
    // novo, so soma o erro pra esta marca nao ser marcada como concluida.
    if (cota.esgotadaEm !== null) {
      erros++;
      cotaEsgotada = true;
      return;
    }

    let anos: AnoV1[];
    try {
      anos = await fetchJson<AnoV1[]>(
        `${API_BASE}/marcas/${marca.codigo}/modelos/${modelo.codigo}/anos`,
        cota,
      );
    } catch (erro) {
      erros++;
      if (erro instanceof CotaEsgotada) cotaEsgotada = true;
      return;
    }

    await emParalelo(anos, opts.concorrencia, async (ano) => {
      if (cota.esgotadaEm !== null) {
        erros++;
        cotaEsgotada = true;
        return;
      }

      try {
        const d = await fetchJson<DetalheV1>(
          `${API_BASE}/marcas/${marca.codigo}/modelos/${modelo.codigo}/anos/${ano.codigo}`,
          cota,
        );

        const nomeMarca = d.Marca ?? marca.nome;
        const nomeModelo = d.Modelo ?? modelo.nome;
        const anoNum =
          d.AnoModelo ?? Number.parseInt(ano.codigo.split("-")[0] ?? "", 10);

        if (!Number.isFinite(anoNum)) {
          erros++;
          return;
        }

        // Sem CodigoFipe, marca+modelo entram na chave para nao colidir com
        // outro modelo que tambem esteja sem codigo.
        const codigo = d.CodigoFipe ?? `${marca.codigo}-${modelo.codigo}`;

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
      } catch (erro) {
        erros++;
        if (erro instanceof CotaEsgotada) cotaEsgotada = true;
      }
    });
  });

  await descarregar(true);

  return { modelos: modelos.length, inseridos, erros, cotaEsgotada };
}
