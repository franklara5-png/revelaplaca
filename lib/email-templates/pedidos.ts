import "server-only";

import { getSiteUrl, SITE_NAME } from "@/lib/site-url";
import { layoutEmail } from "@/lib/email-templates/layout";

type Corpo = { subject: string; html: string; text: string };

/**
 * Entrega do que o cliente pagou. E o e-mail mais importante do site: se ele
 * parecer golpe ou o link nao for obvio, o cliente abre chamado — ou pior,
 * pede estorno achando que nao recebeu.
 */
export function emailRelatorioPronto(
  url: string,
  placaFmt: string,
  diasAcesso: number,
): Corpo {
  const painel = `${getSiteUrl()}/painel`;

  return {
    subject: `Seu relatório da placa ${placaFmt} está pronto`,
    html: layoutEmail({
      preheader: `Pagamento confirmado. O relatório completo da placa ${placaFmt} já pode ser aberto.`,
      titulo: "Seu relatório está pronto",
      placa: placaFmt,
      paragrafos: [
        "Pagamento confirmado. O relatório completo deste veículo já está disponível para você.",
        "Nele você confere o histórico que o vendedor normalmente não conta: <strong>leilão, sinistro, roubo e furto, gravame e restrições</strong>.",
      ],
      destaque: {
        tipo: "sucesso",
        texto: `O acesso fica liberado por <strong>${diasAcesso} dias</strong>. Ele também aparece no seu <a href="${painel}" style="color:#0D545D;">painel</a>, se você comprou com a conta logada.`,
      },
      botao: { texto: "Abrir meu relatório", url },
      nota: "Guarde este e-mail: o link acima é o seu acesso ao relatório. Não o compartilhe — quem tiver o link consegue abrir.",
    }),
    text: `Seu relatório da placa ${placaFmt} está pronto: ${url}\n\nO acesso fica liberado por ${diasAcesso} dias. Não compartilhe este link.`,
  };
}

/**
 * Pagamento entrou mas o fornecedor falhou. O cliente precisa sair daqui
 * sabendo duas coisas: que o dinheiro dele foi recebido e que NAO deve pagar
 * de novo.
 */
export function emailRelatorioProcessando(placaFmt: string): Corpo {
  return {
    subject: `Pagamento confirmado — seu relatório da placa ${placaFmt} está sendo gerado`,
    html: layoutEmail({
      preheader: "Recebemos seu pagamento. O relatório chega por e-mail assim que estiver pronto.",
      titulo: "Pagamento recebido",
      placa: placaFmt,
      paragrafos: [
        "Recebemos seu pagamento, mas o relatório completo deste veículo ainda não pôde ser gerado automaticamente.",
        "Nossa equipe já foi avisada e está cuidando disso. Assim que o relatório estiver pronto, você recebe um novo e-mail com o acesso.",
      ],
      destaque: {
        tipo: "info",
        texto: "<strong>Não é preciso pagar de novo.</strong> Seu pagamento está registrado e vinculado a esta placa.",
      },
    }),
    text: `Pagamento da placa ${placaFmt} confirmado. O relatório está sendo gerado e chega por e-mail assim que estiver pronto. Não é preciso pagar de novo.`,
  };
}

/** Lembrete unico de pedido que ficou sem pagamento. */
export function emailPedidoAbandonado(url: string, placaFmt: string): Corpo {
  return {
    subject: `Seu relatório da placa ${placaFmt} está esperando`,
    html: layoutEmail({
      preheader: "Você começou a compra do relatório e o pagamento ficou pendente.",
      titulo: "Seu relatório está esperando",
      placa: placaFmt,
      paragrafos: [
        "Você começou a compra do relatório completo deste veículo, mas o pagamento ainda não foi concluído.",
        "Se ainda está avaliando o carro, dá para retomar de onde parou — sem preencher nada de novo.",
      ],
      botao: { texto: "Retomar pagamento", url },
      nota: `Este é o único lembrete que o ${SITE_NAME} envia sobre este pedido.`,
    }),
    text: `Retome o pagamento do relatório da placa ${placaFmt}: ${url}\n\nEste é o único lembrete sobre este pedido.`,
  };
}
