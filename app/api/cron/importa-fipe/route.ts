import { NextResponse } from "next/server";
import { getDb } from "@/db";
import {
  buscarMarcas,
  criarEstadoCota,
  importarMarca,
  lerMarcasConcluidas,
  marcarMarcaConcluida,
} from "@/lib/fipe-import";

export const runtime = "nodejs";
export const maxDuration = 300;

// Margem sob o maxDuration pra sempre sobrar tempo de responder antes do
// Vercel matar a funcao no meio de uma marca.
const ORCAMENTO_MS = 4 * 60 * 1000;
const CONCORRENCIA = Number(process.env.FIPE_IMPORT_CONCURRENCY ?? 4);

export async function GET(request: Request) {
  const auth = request.headers.get("authorization");
  const esperado = process.env.CRON_SECRET;

  if (!esperado || auth !== `Bearer ${esperado}`) {
    return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
  }

  const db = getDb();
  const cota = criarEstadoCota();
  const inicio = Date.now();

  const [marcas, feitas] = await Promise.all([
    buscarMarcas(cota),
    lerMarcasConcluidas(db),
  ]);
  const pendentes = marcas.filter((m) => !feitas.has(m.codigo));

  let marcasConcluidas = 0;
  let registrosInseridos = 0;
  let erros = 0;
  let cotaEsgotada = false;
  let processadas = 0;

  for (const marca of pendentes) {
    if (Date.now() - inicio > ORCAMENTO_MS) break;

    const resultado = await importarMarca(db, marca, cota, {
      concorrencia: CONCORRENCIA,
    });

    processadas++;
    registrosInseridos += resultado.inseridos;
    erros += resultado.erros;

    if (resultado.erros === 0) {
      marcasConcluidas++;
      await marcarMarcaConcluida(db, marca);
    }

    if (resultado.cotaEsgotada) {
      cotaEsgotada = true;
      break;
    }
  }

  return NextResponse.json({
    ok: true,
    marcasNoCatalogo: marcas.length,
    marcasPendentesAntes: pendentes.length,
    marcasProcessadas: processadas,
    marcasConcluidas,
    registrosInseridos,
    erros,
    cotaEsgotada,
    duracaoMs: Date.now() - inicio,
  });
}
