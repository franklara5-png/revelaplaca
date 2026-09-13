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
 *
 * Ha tambem um cron em app/api/cron/importa-fipe/route.ts que resume essa
 * mesma importacao automaticamente todo dia, com checkpoint na tabela
 * `fipe_import_progresso` em vez de arquivo local (o filesystem do Vercel e
 * efemero). Este script continua util pra rodar manualmente / testar local.
 */
import "dotenv/config";
import { existsSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import {
  buscarMarcas,
  criarEstadoCota,
  importarMarca,
  CotaEsgotada,
  type MarcaV1,
} from "../lib/fipe-import";

const CHECKPOINT = ".fipe-checkpoint.json";

const CONCURRENCY = Number(process.env.FIPE_IMPORT_CONCURRENCY ?? 6);
const LIMITE_MARCAS = process.env.FIPE_IMPORT_LIMIT
  ? Number(process.env.FIPE_IMPORT_LIMIT)
  : undefined;

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
  const cota = criarEstadoCota();
  const marcas = await buscarMarcas(cota);
  const marcasAlvo: MarcaV1[] = LIMITE_MARCAS
    ? marcas.slice(0, LIMITE_MARCAS)
    : marcas;
  const feitas = lerCheckpoint();
  const pendentes = marcasAlvo.filter((m) => !feitas.has(m.codigo));

  console.info(
    `FIPE v1 - ${pendentes.length} marcas pendentes de ${marcasAlvo.length}` +
      ` - concorrencia ${CONCURRENCY}` +
      (feitas.size ? ` - ${feitas.size} ja concluidas (checkpoint)` : ""),
  );

  let totalInseridos = 0;
  let totalErros = 0;

  for (const marca of pendentes) {
    const resultado = await importarMarca(db, marca, cota, {
      concorrencia: CONCURRENCY,
    });

    totalInseridos += resultado.inseridos;
    totalErros += resultado.erros;

    if (resultado.erros === 0) {
      feitas.add(marca.codigo);
      salvarCheckpoint(feitas);
      console.info(`ok ${marca.nome} (${resultado.modelos} modelos)`);
    } else {
      console.warn(
        `! ${marca.nome}: ${resultado.erros} falhas — nao marcada como concluida,` +
          ` sera refeita na proxima execucao` +
          (resultado.erros > 10
            ? ". Muitos erros costumam ser HTTP 429: baixe FIPE_IMPORT_CONCURRENCY."
            : ""),
      );
    }

    if (resultado.cotaEsgotada) {
      throw new CotaEsgotada(cota.esgotadaEm ?? 86_400);
    }
  }

  console.info(`\nConcluido: ${totalInseridos} registros, ${totalErros} erros.`);
  if (totalErros === 0 && existsSync(CHECKPOINT)) {
    unlinkSync(CHECKPOINT);
    console.info("Checkpoint removido (importacao completa).");
  }
}

main().catch((erro) => {
  if (erro instanceof CotaEsgotada) {
    const liberaEm = new Date(Date.now() + erro.segundos * 1000);
    console.error(
      `\nCOTA DIARIA DA API ESGOTADA.\n` +
        `A parallelum v1 respondeu 429 com Retry-After de ${erro.segundos}s ` +
        `(~${Math.ceil(erro.segundos / 3600)}h).\n` +
        `Libera por volta de ${liberaEm.toLocaleString("pt-BR")}.\n\n` +
        `O checkpoint esta intacto: rodar de novo depois desse horario retoma\n` +
        `exatamente de onde parou, sem repetir o que ja entrou.\n` +
        `Para gastar menos cota por dia: FIPE_IMPORT_CONCURRENCY=3\n`,
    );
    // exitCode em vez de exit(): com o handle HTTP do neon ainda aberto, o
    // exit() abrupto derruba o libuv com assertion no Windows.
    process.exitCode = 2;
    return;
  }

  const msg = (erro as Error)?.message ?? String(erro);
  if (msg.includes("429")) {
    console.error(
      "\nA API esta limitando as requisicoes (HTTP 429) em rajada.\n" +
        "Espere alguns minutos e rode de novo — o checkpoint retoma de onde parou.",
    );
  } else {
    console.error(erro);
  }

  process.exit(1);
});
