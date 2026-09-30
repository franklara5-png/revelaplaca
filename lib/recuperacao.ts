import "server-only";

import { sendEmail } from "@/lib/email";
import { formatarPlaca } from "@/lib/placa";
import {
  buscarPedidosAbandonados,
  marcarEmailRecuperacaoEnviado,
} from "@/lib/pedidos";
import { getSiteUrl } from "@/lib/site-url";
import { emailPedidoAbandonado } from "@/lib/email-templates/pedidos";

const MAX_TENTATIVAS = 3;
const BACKOFF_MS = [0, 1_000, 2_000];

async function enviarEmailRecuperacao(
  email: string,
  placa: string,
  pedidoId: string,
): Promise<boolean> {
  const url = `${getSiteUrl()}/checkout/${placa}?pedido=${pedidoId}`;

  return sendEmail({
    to: email,
    ...emailPedidoAbandonado(url, formatarPlaca(placa)),
  });
}

/** Devolve se ALGUMA tentativa deu certo. */
async function tentarEnviarComBackoff(
  email: string,
  placa: string,
  pedidoId: string,
): Promise<boolean> {
  for (let i = 0; i < MAX_TENTATIVAS; i++) {
    if (BACKOFF_MS[i] > 0) {
      await new Promise((r) => setTimeout(r, BACKOFF_MS[i]));
    }
    const ok = await enviarEmailRecuperacao(email, placa, pedidoId);
    if (ok) return true;
  }
  return false;
}

export async function processarRecuperacaoAbandono(): Promise<{
  processados: number;
  enviados: number;
  falharam: number;
}> {
  const pendentes = await buscarPedidosAbandonados();
  let enviados = 0;
  let falharam = 0;

  for (const pedido of pendentes) {
    const ok = await tentarEnviarComBackoff(
      pedido.email,
      pedido.placa,
      pedido.id,
    );

    if (!ok) {
      // NAO marcar como enviado: a versao anterior marcava mesmo apos as tres
      // tentativas falharem, e como a busca de abandonados filtra por
      // emailRecuperacaoEnviado = false, o pedido nunca mais era tentado.
      // Uma falha temporaria da Brevo custava a recuperacao daquela venda,
      // para sempre e sem aviso — o cron ainda reportava sucesso.
      falharam++;
      console.error(
        "[recuperacao] falhou apos",
        MAX_TENTATIVAS,
        "tentativas, pedido segue elegivel:",
        pedido.id,
      );
      continue;
    }

    await marcarEmailRecuperacaoEnviado(pedido.id);
    enviados++;
  }

  return { processados: pendentes.length, enviados, falharam };
}
