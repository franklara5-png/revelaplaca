import "server-only";

import { SITE_NAME } from "@/lib/site-url";

type Corpo = { subject: string; html: string; text: string };

const BOTAO =
  "display:inline-block;padding:12px 24px;background:#0D545D;color:#fff;border-radius:999px;text-decoration:none;font-weight:600;";

const RODAPE_IGNORAR =
  "Se não foi você que pediu isso, ignore este e-mail: nada acontece sem clicar no link acima.";

export function emailVerificarEndereco(url: string, nome?: string): Corpo {
  const saudacao = nome ? `Olá, ${nome.split(" ")[0]}!` : "Olá!";

  return {
    subject: `Confirme seu e-mail no ${SITE_NAME}`,
    html: `
      <p>${saudacao}</p>
      <p>Falta um passo para sua conta ficar pronta: confirmar que este e-mail é seu.</p>
      <p><a href="${url}" style="${BOTAO}">Confirmar meu e-mail</a></p>
      <p style="font-size:12px;color:#64748b;margin-top:24px;">${RODAPE_IGNORAR}</p>
      <p>— ${SITE_NAME}</p>
    `,
    text: `Confirme seu e-mail no ${SITE_NAME}: ${url}\n\n${RODAPE_IGNORAR}`,
  };
}

export function emailRedefinirSenha(url: string, nome?: string): Corpo {
  const saudacao = nome ? `Olá, ${nome.split(" ")[0]}!` : "Olá!";

  return {
    subject: `Redefinir sua senha no ${SITE_NAME}`,
    html: `
      <p>${saudacao}</p>
      <p>Recebemos um pedido para redefinir a senha da sua conta.</p>
      <p><a href="${url}" style="${BOTAO}">Criar uma senha nova</a></p>
      <p style="font-size:12px;color:#64748b;margin-top:24px;">O link vale por 1 hora. ${RODAPE_IGNORAR}</p>
      <p>— ${SITE_NAME}</p>
    `,
    text: `Redefina sua senha no ${SITE_NAME}: ${url}\n\nO link vale por 1 hora. ${RODAPE_IGNORAR}`,
  };
}
