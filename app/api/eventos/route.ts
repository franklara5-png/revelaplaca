import { NextResponse } from "next/server";
import { z } from "zod";
import { registrarEvento } from "@/lib/eventos";
import {
  eventoClientePermitido,
  sanitizarMeta,
} from "@/lib/eventos-constants";
import {
  rateLimitEventosApiExcedido,
  registrarHitEventosApi,
} from "@/lib/eventos-rate-limit";
import { normalizarPlaca, validarPlaca } from "@/lib/placa";

const bodySchema = z.object({
  nome: z.string(),
  placa: z.string().optional(),
  meta: z.record(z.string(), z.unknown()).optional(),
});

export async function POST(request: Request) {
  if (await rateLimitEventosApiExcedido()) {
    return NextResponse.json({ erro: "Limite excedido." }, { status: 429 });
  }

  let body: z.infer<typeof bodySchema>;
  try {
    body = bodySchema.parse(await request.json());
  } catch {
    return NextResponse.json({ erro: "Requisição inválida." }, { status: 400 });
  }

  if (!eventoClientePermitido(body.nome)) {
    return NextResponse.json({ erro: "Evento não permitido." }, { status: 400 });
  }

  const placa =
    body.placa && validarPlaca(normalizarPlaca(body.placa))
      ? normalizarPlaca(body.placa)
      : undefined;

  await registrarHitEventosApi();
  await registrarEvento(body.nome, {
    placa,
    meta: sanitizarMeta(body.meta),
  });

  return NextResponse.json({ ok: true });
}
