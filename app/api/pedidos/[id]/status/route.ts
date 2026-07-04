import { NextResponse } from "next/server";
import {
  buscarPagamento,
  pagamentoConfirmado,
} from "@/lib/asaas";
import { buscarPedido, sincronizarStatusPagamento } from "@/lib/pedidos";
import {
  buscarRelatorioPorPedido,
  gerarRelatorioParaPedido,
} from "@/lib/relatorios";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  const pedido = await buscarPedido(id);
  if (!pedido) {
    return NextResponse.json({ erro: "Pedido não encontrado." }, { status: 404 });
  }

  let status = pedido.status;
  let relatorioToken: string | null = null;

  if (pedido.asaasPaymentId && pedido.status === "pendente") {
    try {
      const pagamento = await buscarPagamento(pedido.asaasPaymentId);
      const atualizado = await sincronizarStatusPagamento(pedido, pagamento.status);
      status = atualizado.status;

      if (pagamentoConfirmado(pagamento.status)) {
        const gerado = await gerarRelatorioParaPedido(atualizado.id);
        relatorioToken = gerado?.token ?? null;
      }
    } catch (erro) {
      console.error("[pedido-status] erro ao sincronizar:", erro);
    }
  }

  if (status === "pago") {
    let relatorio = await buscarRelatorioPorPedido(id);
    if (!relatorio) {
      const gerado = await gerarRelatorioParaPedido(id);
      relatorioToken = gerado?.token ?? null;
    } else {
      relatorioToken = relatorio.tokenAcesso;
    }
  }

  return NextResponse.json({
    status,
    relatorioToken,
    placa: pedido.placa,
  });
}
