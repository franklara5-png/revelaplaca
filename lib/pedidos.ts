import "server-only";

import { and, eq, gte, lte, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { pedidos } from "@/db/schema";
import {
  PRECO_RELATORIO_CENTAVOS,
  PRODUTO_RELATORIO,
} from "@/lib/constants/pagamento";

export type Pedido = typeof pedidos.$inferSelect;

export async function criarPedido(input: {
  id?: string;
  placa: string;
  email: string;
  asaasCustomerId: string;
  asaasPaymentId: string;
  valorCentavos?: number;
}): Promise<Pedido> {
  const [pedido] = await getDb()
    .insert(pedidos)
    .values({
      ...(input.id ? { id: input.id } : {}),
      placa: input.placa,
      email: input.email,
      produto: PRODUTO_RELATORIO,
      valorCentavos: input.valorCentavos ?? PRECO_RELATORIO_CENTAVOS,
      asaasCustomerId: input.asaasCustomerId,
      asaasPaymentId: input.asaasPaymentId,
      status: "pendente",
    })
    .returning();

  return pedido;
}

export async function buscarPedido(id: string): Promise<Pedido | null> {
  const [pedido] = await getDb()
    .select()
    .from(pedidos)
    .where(eq(pedidos.id, id))
    .limit(1);

  return pedido ?? null;
}

export async function buscarPedidoPorPaymentId(
  asaasPaymentId: string,
): Promise<Pedido | null> {
  const [pedido] = await getDb()
    .select()
    .from(pedidos)
    .where(eq(pedidos.asaasPaymentId, asaasPaymentId))
    .limit(1);

  return pedido ?? null;
}

export async function marcarPedidoPago(id: string): Promise<Pedido | null> {
  const [pedido] = await getDb()
    .update(pedidos)
    .set({ status: "pago", pagoEm: new Date() })
    .where(eq(pedidos.id, id))
    .returning();

  return pedido ?? null;
}

export async function atualizarPaymentId(
  pedidoId: string,
  asaasPaymentId: string,
): Promise<Pedido | null> {
  const [pedido] = await getDb()
    .update(pedidos)
    .set({ asaasPaymentId })
    .where(eq(pedidos.id, pedidoId))
    .returning();

  return pedido ?? null;
}

export async function marcarEmailRecuperacaoEnviado(pedidoId: string): Promise<void> {
  await getDb()
    .update(pedidos)
    .set({ emailRecuperacaoEnviado: true })
    .where(eq(pedidos.id, pedidoId));
}

export async function buscarPedidosAbandonados() {
  const umaHoraAtras = new Date(Date.now() - 60 * 60 * 1000);
  const vinteQuatroHorasAtras = new Date(Date.now() - 24 * 60 * 60 * 1000);

  return getDb()
    .select()
    .from(pedidos)
    .where(
      and(
        eq(pedidos.status, "pendente"),
        eq(pedidos.emailRecuperacaoEnviado, false),
        lte(pedidos.criadoEm, umaHoraAtras),
        gte(pedidos.criadoEm, vinteQuatroHorasAtras),
      ),
    );
}

export async function sincronizarStatusPagamento(
  pedido: Pedido,
  statusAsaas: string,
): Promise<Pedido> {
  const { pagamentoConfirmado } = await import("@/lib/asaas");

  if (pedido.status === "pago") return pedido;

  if (pagamentoConfirmado(statusAsaas)) {
    const atualizado = await marcarPedidoPago(pedido.id);
    return atualizado ?? pedido;
  }

  return pedido;
}
