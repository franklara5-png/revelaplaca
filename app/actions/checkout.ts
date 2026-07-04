"use server";

import { z } from "zod";
import {
  criarCliente,
  criarPagamento,
  buscarPixQrCode,
  buscarPagamento,
  pagamentoExpirado,
} from "@/lib/asaas";
import {
  PRECO_RELATORIO_REAIS,
  type MetodoPagamento,
} from "@/lib/constants/pagamento";
import {
  atualizarPaymentId,
  buscarPedido,
  criarPedido,
} from "@/lib/pedidos";
import { normalizarPlaca, validarPlaca } from "@/lib/placa";
import { formatarPlaca } from "@/lib/placa";
import { registrarEvento } from "@/lib/eventos";

const schema = z.object({
  placa: z.string().min(1),
  email: z.email(),
  metodo: z.enum(["PIX", "CREDIT_CARD"]),
});

export type CheckoutResult =
  | {
      ok: true;
      pedidoId: string;
      metodo: MetodoPagamento;
      pix?: {
        encodedImage: string;
        payload: string;
        expirationDate: string;
      };
      invoiceUrl?: string;
    }
  | { ok: false; erro: string };

async function prepararPagamentoPedido(
  pedidoId: string,
  placa: string,
  email: string,
  metodo: MetodoPagamento,
): Promise<CheckoutResult> {
  const cliente = await criarCliente(email);
  const pagamento = await criarPagamento({
    customerId: cliente.id,
    valorReais: PRECO_RELATORIO_REAIS,
    externalReference: pedidoId,
    descricao: `Relatório completo — placa ${formatarPlaca(placa)}`,
    billingType: metodo,
  });

  const pedido = await criarPedido({
    id: pedidoId,
    placa,
    email,
    asaasCustomerId: cliente.id,
    asaasPaymentId: pagamento.id,
  });

  if (metodo === "CREDIT_CARD") {
    if (!pagamento.invoiceUrl) {
      return { ok: false, erro: "Não foi possível gerar o link de pagamento." };
    }
    return {
      ok: true,
      pedidoId: pedido.id,
      metodo: "CREDIT_CARD",
      invoiceUrl: pagamento.invoiceUrl,
    };
  }

  const pix = await buscarPixQrCode(pagamento.id);

  void registrarEvento("pix_gerado", { placa });

  return {
    ok: true,
    pedidoId: pedido.id,
    metodo: "PIX",
    pix: {
      encodedImage: pix.encodedImage,
      payload: pix.payload,
      expirationDate: pix.expirationDate,
    },
  };
}

export async function iniciarCheckout(
  input: z.infer<typeof schema>,
): Promise<CheckoutResult> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, erro: "Dados inválidos. Verifique e-mail e placa." };
  }

  const placa = normalizarPlaca(parsed.data.placa);
  if (!validarPlaca(placa)) {
    return { ok: false, erro: "Placa inválida." };
  }

  if (!process.env.ASAAS_API_KEY) {
    return { ok: false, erro: "Pagamentos temporariamente indisponíveis." };
  }

  try {
    const pedidoId = crypto.randomUUID();
    return await prepararPagamentoPedido(
      pedidoId,
      placa,
      parsed.data.email,
      parsed.data.metodo,
    );
  } catch (erro) {
    console.error("[checkout]", erro);
    return {
      ok: false,
      erro: "Erro ao processar pagamento. Tente novamente em instantes.",
    };
  }
}

export async function retomarCheckout(input: {
  pedidoId: string;
  metodo: MetodoPagamento;
}): Promise<CheckoutResult> {
  const pedido = await buscarPedido(input.pedidoId);
  if (!pedido || pedido.status !== "pendente") {
    return { ok: false, erro: "Pedido indisponível para retomada." };
  }

  if (!process.env.ASAAS_API_KEY) {
    return { ok: false, erro: "Pagamentos temporariamente indisponíveis." };
  }

  try {
    if (pedido.asaasPaymentId) {
      const pagamentoAtual = await buscarPagamento(pedido.asaasPaymentId);
      if (!pagamentoExpirado(pagamentoAtual.status)) {
        if (input.metodo === "CREDIT_CARD" && pagamentoAtual.invoiceUrl) {
          return {
            ok: true,
            pedidoId: pedido.id,
            metodo: "CREDIT_CARD",
            invoiceUrl: pagamentoAtual.invoiceUrl,
          };
        }
        if (input.metodo === "PIX") {
          const pix = await buscarPixQrCode(pedido.asaasPaymentId);
          return {
            ok: true,
            pedidoId: pedido.id,
            metodo: "PIX",
            pix: {
              encodedImage: pix.encodedImage,
              payload: pix.payload,
              expirationDate: pix.expirationDate,
            },
          };
        }
      }
    }

    const pagamento = await criarPagamento({
      customerId: pedido.asaasCustomerId!,
      valorReais: PRECO_RELATORIO_REAIS,
      externalReference: pedido.id,
      descricao: `Relatório completo — placa ${formatarPlaca(pedido.placa)}`,
      billingType: input.metodo,
    });

    await atualizarPaymentId(pedido.id, pagamento.id);

    if (input.metodo === "CREDIT_CARD") {
      if (!pagamento.invoiceUrl) {
        return { ok: false, erro: "Não foi possível gerar o link de pagamento." };
      }
      return {
        ok: true,
        pedidoId: pedido.id,
        metodo: "CREDIT_CARD",
        invoiceUrl: pagamento.invoiceUrl,
      };
    }

    const pix = await buscarPixQrCode(pagamento.id);
    return {
      ok: true,
      pedidoId: pedido.id,
      metodo: "PIX",
      pix: {
        encodedImage: pix.encodedImage,
        payload: pix.payload,
        expirationDate: pix.expirationDate,
      },
    };
  } catch (erro) {
    console.error("[checkout/retomar]", erro);
    return {
      ok: false,
      erro: "Erro ao retomar pagamento. Tente novamente em instantes.",
    };
  }
}
