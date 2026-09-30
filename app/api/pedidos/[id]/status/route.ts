import { after, NextResponse } from "next/server";
import {
  buscarPagamento,
  pagamentoConfirmado,
} from "@/lib/asaas";
import { buscarPedido, sincronizarStatusPagamento } from "@/lib/pedidos";
import {
  buscarRelatorioPorPedido,
  gerarRelatorioParaPedido,
} from "@/lib/relatorios";

// A geracao, quando disparada daqui, roda depois da resposta (after) e pode
// levar minutos por causa do leilao.
export const maxDuration = 300;

type RouteContext = { params: Promise<{ id: string }> };

/**
 * A pagina de checkout pergunta aqui a cada poucos segundos ate o relatorio
 * ficar pronto. Esta rota NUNCA espera a geracao: se o pedido esta pago e o
 * relatorio ainda nao existe, dispara a geracao em segundo plano e responde
 * na hora com relatorioToken null — a pagina continua perguntando.
 *
 * Antes ela esperava a geracao inteira a cada pergunta. Com fornecedor que
 * responde em segundos ninguem notava; com o leilao levando minutos, cada
 * pergunta abriria uma geracao nova e paga. Agora a trava em
 * gerarRelatorioParaPedido faz as perguntas repetidas nao fazerem nada.
 */
export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  const pedido = await buscarPedido(id);
  if (!pedido) {
    return NextResponse.json({ erro: "Pedido não encontrado." }, { status: 404 });
  }

  let status = pedido.status;

  if (pedido.asaasPaymentId && pedido.status === "pendente") {
    try {
      const pagamento = await buscarPagamento(pedido.asaasPaymentId);
      const atualizado = await sincronizarStatusPagamento(pedido, pagamento.status);
      status = atualizado.status;
      if (pagamentoConfirmado(pagamento.status)) status = "pago";
    } catch (erro) {
      console.error("[pedido-status] erro ao sincronizar:", erro);
    }
  }

  let relatorioToken: string | null = null;

  if (status === "pago") {
    const relatorio = await buscarRelatorioPorPedido(id);
    if (relatorio) {
      relatorioToken = relatorio.tokenAcesso;
    } else {
      after(() => gerarRelatorioParaPedido(id));
    }
  }

  return NextResponse.json({
    status,
    relatorioToken,
    placa: pedido.placa,
  });
}
