import { NextResponse } from "next/server";
import { processarRecuperacaoAbandono } from "@/lib/recuperacao";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const auth = request.headers.get("authorization");
  const esperado = process.env.CRON_SECRET;

  if (!esperado || auth !== `Bearer ${esperado}`) {
    return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
  }

  const resultado = await processarRecuperacaoAbandono();
  return NextResponse.json({ ok: true, ...resultado });
}
