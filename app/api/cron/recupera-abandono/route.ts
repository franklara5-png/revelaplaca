import { NextResponse } from "next/server";
import { processarRecuperacaoAbandono } from "@/lib/recuperacao";
import { limparVisitasAntigas } from "@/lib/track/rate-limit";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const auth = request.headers.get("authorization");
  const esperado = process.env.CRON_SECRET;

  if (!esperado || auth !== `Bearer ${esperado}`) {
    return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
  }

  const resultado = await processarRecuperacaoAbandono();

  // Aproveita o unico cron diario do projeto para o expurgo de retencao.
  // Falha aqui nao pode derrubar a recuperacao de venda, que e o que importa
  // nesta rota — por isso o catch separado.
  let visitasExpurgadas = 0;
  try {
    visitasExpurgadas = await limparVisitasAntigas();
  } catch (erro) {
    console.error("[cron] falha no expurgo de site_visits:", erro);
  }

  return NextResponse.json({ ok: true, ...resultado, visitasExpurgadas });
}
