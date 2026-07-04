import { NextResponse } from "next/server";
import {
  eventoPagamentoConfirmado,
  extrairPagamentoWebhook,
  type WebhookPayload,
} from "@/lib/asaas";
import { buscarPedidoPorPaymentId } from "@/lib/pedidos";
import { processarPagamentoConfirmado } from "@/lib/relatorios";

export async function POST(request: Request) {
  const tokenEsperado = process.env.ASAAS_WEBHOOK_TOKEN;
  const tokenRecebido = request.headers.get("asaas-access-token");

  if (!tokenEsperado || tokenRecebido !== tokenEsperado) {
    return NextResponse.json({ erro: "Não autorizado." }, { status: 401 });
  }

  let body: WebhookPayload;
  try {
    body = (await request.json()) as WebhookPayload;
  } catch {
    return NextResponse.json({ erro: "Payload inválido." }, { status: 400 });
  }

  if (!eventoPagamentoConfirmado(body.event)) {
    return NextResponse.json({ ok: true, ignorado: true });
  }

  const pagamento = extrairPagamentoWebhook(body);
  if (!pagamento?.id) {
    return NextResponse.json({ ok: true, ignorado: true });
  }

  const pedido = await buscarPedidoPorPaymentId(pagamento.id);
  if (!pedido) {
    console.warn("[webhook-asaas] pedido não encontrado:", pagamento.id);
    return NextResponse.json({ ok: true, ignorado: true });
  }

  await processarPagamentoConfirmado(pedido.id);

  return NextResponse.json({ ok: true });
}
