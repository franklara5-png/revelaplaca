import "server-only";

import { sendEmail } from "@/lib/email";
import { formatarPlaca } from "@/lib/placa";
import {
  buscarPedidosAbandonados,
  marcarEmailRecuperacaoEnviado,
} from "@/lib/pedidos";
import { getSiteUrl, SITE_NAME } from "@/lib/site-url";

const MAX_TENTATIVAS = 3;
const BACKOFF_MS = [0, 1_000, 2_000];

async function enviarEmailRecuperacao(
  email: string,
  placa: string,
  pedidoId: string,
): Promise<boolean> {
  const placaFmt = formatarPlaca(placa);
  const url = `${getSiteUrl()}/checkout/${placa}?pedido=${pedidoId}`;

  return sendEmail({
    to: email,
    subject: `Seu relatório da placa ${placaFmt} está esperando`,
    html: `
      <p>Olá,</p>
      <p>Você iniciou a compra do relatório completo da placa <strong>${placaFmt}</strong>, mas o pagamento ainda não foi concluído.</p>
      <p><a href="${url}" style="display:inline-block;padding:12px 24px;background:#0D545D;color:#fff;border-radius:999px;text-decoration:none;font-weight:600;">Retomar pagamento</a></p>
      <p style="font-size:12px;color:#64748b;margin-top:24px;">Este é o único lembrete que enviaremos sobre este pedido.</p>
      <p>— ${SITE_NAME}</p>
    `,
    text: `Retome o pagamento do relatório da placa ${placaFmt}: ${url}. Este é o único lembrete.`,
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
