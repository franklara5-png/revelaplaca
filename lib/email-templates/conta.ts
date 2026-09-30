import "server-only";

import { SITE_NAME } from "@/lib/site-url";
import { layoutEmail, primeiroNome } from "@/lib/email-templates/layout";

type Corpo = { subject: string; html: string; text: string };

const NAO_FOI_VOCE =
  "Se não foi você que pediu isso, pode ignorar este e-mail — nada acontece sem clicar no botão.";

export function emailVerificarEndereco(url: string, nome?: string): Corpo {
  const primeiro = primeiroNome(nome);

  return {
    subject: `Confirme seu e-mail no ${SITE_NAME}`,
    html: layoutEmail({
      preheader: "Falta um clique para sua conta ficar pronta.",
      titulo: primeiro ? `Bem-vindo, ${primeiro}!` : "Bem-vindo!",
      paragrafos: [
        "Sua conta no RevelaPlaca foi criada. Falta só confirmar que este e-mail é seu — é isso que libera a entrada.",
        "Depois de confirmar, as placas que você consultar e os relatórios que comprar ficam guardados no seu painel.",
      ],
      botao: { texto: "Confirmar meu e-mail", url },
      nota: `O link vale por 1 hora. ${NAO_FOI_VOCE}`,
    }),
    text: `Confirme seu e-mail no ${SITE_NAME}: ${url}\n\nO link vale por 1 hora. ${NAO_FOI_VOCE}`,
  };
}

export function emailRedefinirSenha(url: string, nome?: string): Corpo {
  const primeiro = primeiroNome(nome);

  return {
    subject: `Redefinir sua senha no ${SITE_NAME}`,
    html: layoutEmail({
      preheader: "Crie uma senha nova para sua conta.",
      titulo: "Redefinir sua senha",
      paragrafos: [
        primeiro ? `Olá, ${primeiro}.` : "Olá.",
        "Recebemos um pedido para criar uma senha nova para a sua conta. Clique no botão abaixo para escolher a nova senha.",
      ],
      botao: { texto: "Criar senha nova", url },
      destaque: {
        tipo: "aviso",
        texto:
          "Por segurança, o link vale por <strong>1 hora</strong> e só funciona uma vez.",
      },
      nota: `${NAO_FOI_VOCE} Sua senha atual continua valendo.`,
    }),
    text: `Redefina sua senha no ${SITE_NAME}: ${url}\n\nO link vale por 1 hora. ${NAO_FOI_VOCE}`,
  };
}
