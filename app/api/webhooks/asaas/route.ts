import { timingSafeEqual } from "node:crypto";
import { after, NextResponse } from "next/server";
import {
  eventoPagamentoConfirmado,
  extrairPagamentoWebhook,
  type WebhookPayload,
} from "@/lib/asaas";
import { buscarPedidoPorPaymentId } from "@/lib/pedidos";
import {
  gerarRelatorioParaPedido,
  marcarPedidoComoPago,
} from "@/lib/relatorios";

// A geracao do relatorio roda DEPOIS da resposta (after), dentro desta mesma
// funcao — e o endpoint de leilao pode levar minutos. Sem isto a funcao
// morreria no teto padrao no meio da consulta paga.
export const maxDuration = 300;

/** Comparacao de tempo constante: nao vaza, pelo tempo, quantos caracteres batem. */
function tokenConfere(recebido: string | null, esperado: string): boolean {
  if (!recebido) return false;
  const a = Buffer.from(recebido);
  const b = Buffer.from(esperado);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(request: Request) {
  const tokenEsperado = process.env.ASAAS_WEBHOOK_TOKEN;
  const tokenRecebido = request.headers.get("asaas-access-token");

  if (!tokenEsperado || !tokenConfere(tokenRecebido, tokenEsperado)) {
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

  // Marcar como pago e rapido e atomico: fica antes da resposta, para o
  // pagamento nunca se perder mesmo se a geracao falhar depois.
  await marcarPedidoComoPago(pedido.id);

  // Gerar fica para DEPOIS da resposta. O relatorio pode levar minutos, e o
  // Asaas nao espera: reenviaria o aviso. O reenvio nao duplica a consulta
  // paga — gerarRelatorioParaPedido tem trava por pedido.
  after(() => gerarRelatorioParaPedido(pedido.id));

  return NextResponse.json({ ok: true });
}
