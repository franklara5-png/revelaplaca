import "server-only";

import { getSiteUrl, SITE_NAME } from "@/lib/site-url";

// Layout unico de todos os e-mails do site.
//
// E-mail nao e pagina web: Gmail, Outlook e Apple Mail ignoram <style>, CSS
// externo, flex e grid de formas diferentes. Por isso aqui e tudo tabela e
// estilo inline — e o unico formato que renderiza igual nos tres. Imagem
// tambem fica de fora: metade dos clientes bloqueia por padrao, e um e-mail
// cujo cabecalho e uma imagem quebrada parece golpe, justamente num site sobre
// golpe. A marca e texto.

const COR = {
  primaria: "#0D545D",
  primaria600: "#148A96",
  primaria50: "#F0F9FA",
  tinta: "#0F172A",
  texto: "#334155",
  apagado: "#64748B",
  borda: "#E2E8F0",
  fundo: "#F1F5F9",
  sucesso: "#16A34A",
  sucessoFundo: "#F0FDF4",
  aviso: "#D97706",
  avisoFundo: "#FFFBEB",
} as const;

const FONTE =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

/** Tudo que vem de usuario (nome, e-mail) passa por aqui antes de entrar no HTML. */
export function escaparHtml(texto: string): string {
  return texto
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function primeiroNome(nome?: string | null): string | null {
  const primeiro = nome?.trim().split(/\s+/)[0];
  return primeiro ? escaparHtml(primeiro) : null;
}

type Destaque = {
  tipo: "sucesso" | "aviso" | "info";
  texto: string;
};

export type EmailLayout = {
  /** Linha que aparece ao lado do assunto na caixa de entrada. */
  preheader: string;
  titulo: string;
  /** Paragrafos em HTML. Valores de usuario ja devem vir escapados. */
  paragrafos: string[];
  /** Placa ja formatada (ABC-1D23). Desenhada como placa Mercosul. */
  placa?: string;
  botao?: { texto: string; url: string };
  destaque?: Destaque;
  /** Texto pequeno no fim do cartao: prazo do link, "se nao foi voce", etc. */
  nota?: string;
};

function blocoPlaca(placa: string): string {
  // Placa Mercosul: faixa azul com "BRASIL" em cima, caracteres grandes
  // embaixo. Feita em tabela para sobreviver ao Outlook.
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:8px auto 24px;border-collapse:separate;">
      <tr>
        <td style="border:2px solid ${COR.tinta};border-radius:8px;overflow:hidden;background:#FFFFFF;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
            <tr>
              <td style="background:#1E40AF;color:#FFFFFF;font-family:${FONTE};font-size:10px;font-weight:700;letter-spacing:3px;text-align:center;padding:3px 24px;border-radius:6px 6px 0 0;">
                BRASIL
              </td>
            </tr>
            <tr>
              <td style="font-family:'Courier New',Courier,monospace;font-size:30px;font-weight:700;letter-spacing:4px;color:${COR.tinta};text-align:center;padding:8px 28px 10px;">
                ${escaparHtml(placa)}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>`;
}

function blocoBotao(texto: string, url: string): string {
  // Botao "a prova de bala": o link e a celula inteira, entao funciona mesmo
  // quando o cliente de e-mail descarta padding em <a>.
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:28px auto 8px;">
      <tr>
        <td align="center" bgcolor="${COR.primaria}" style="border-radius:999px;">
          <a href="${url}" target="_blank" style="display:inline-block;padding:14px 32px;font-family:${FONTE};font-size:15px;font-weight:600;color:#FFFFFF;text-decoration:none;border-radius:999px;">
            ${texto}
          </a>
        </td>
      </tr>
    </table>
    <p style="margin:16px 0 0;font-family:${FONTE};font-size:12px;line-height:18px;color:${COR.apagado};text-align:center;">
      Se o botão não funcionar, copie este endereço no navegador:<br>
      <a href="${url}" style="color:${COR.primaria600};word-break:break-all;">${url}</a>
    </p>`;
}

function blocoDestaque({ tipo, texto }: Destaque): string {
  const cores =
    tipo === "sucesso"
      ? { borda: COR.sucesso, fundo: COR.sucessoFundo }
      : tipo === "aviso"
        ? { borda: COR.aviso, fundo: COR.avisoFundo }
        : { borda: COR.primaria600, fundo: COR.primaria50 };

  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:20px 0 4px;">
      <tr>
        <td style="background:${cores.fundo};border-left:4px solid ${cores.borda};border-radius:8px;padding:14px 16px;font-family:${FONTE};font-size:14px;line-height:21px;color:${COR.tinta};">
          ${texto}
        </td>
      </tr>
    </table>`;
}

export function layoutEmail(email: EmailLayout): string {
  const site = getSiteUrl();

  const paragrafos = email.paragrafos
    .map(
      (p) =>
        `<p style="margin:0 0 14px;font-family:${FONTE};font-size:15px;line-height:24px;color:${COR.texto};">${p}</p>`,
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>${escaparHtml(email.titulo)}</title>
</head>
<body style="margin:0;padding:0;background:${COR.fundo};-webkit-text-size-adjust:100%;">
  <!-- preheader: aparece na caixa de entrada, nao no corpo -->
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
    ${escaparHtml(email.preheader)}&#8203;&nbsp;&#8203;&nbsp;&#8203;&nbsp;&#8203;&nbsp;&#8203;&nbsp;
  </div>

  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:${COR.fundo};">
    <tr>
      <td align="center" style="padding:32px 16px;">

        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:560px;">

          <!-- marca -->
          <tr>
            <td align="center" style="padding:0 0 20px;">
              <a href="${site}" target="_blank" style="text-decoration:none;">
                <span style="display:inline-block;background:${COR.primaria};color:#FFFFFF;font-family:${FONTE};font-size:13px;font-weight:800;letter-spacing:1px;padding:5px 9px;border-radius:6px;vertical-align:middle;">RP</span>
                <span style="font-family:${FONTE};font-size:20px;font-weight:700;color:${COR.primaria};vertical-align:middle;padding-left:6px;">${SITE_NAME}</span>
              </a>
            </td>
          </tr>

          <!-- cartao -->
          <tr>
            <td style="background:#FFFFFF;border:1px solid ${COR.borda};border-radius:16px;padding:36px 32px;">
              <h1 style="margin:0 0 18px;font-family:${FONTE};font-size:22px;line-height:30px;font-weight:700;color:${COR.tinta};text-align:center;">
                ${email.titulo}
              </h1>

              ${email.placa ? blocoPlaca(email.placa) : ""}

              ${paragrafos}

              ${email.destaque ? blocoDestaque(email.destaque) : ""}

              ${email.botao ? blocoBotao(email.botao.texto, email.botao.url) : ""}

              ${
                email.nota
                  ? `<p style="margin:28px 0 0;padding-top:20px;border-top:1px solid ${COR.borda};font-family:${FONTE};font-size:12px;line-height:18px;color:${COR.apagado};text-align:center;">${email.nota}</p>`
                  : ""
              }
            </td>
          </tr>

          <!-- rodape -->
          <tr>
            <td align="center" style="padding:24px 16px 0;font-family:${FONTE};font-size:12px;line-height:18px;color:${COR.apagado};">
              <strong style="color:${COR.texto};">${SITE_NAME}</strong> — o que o vendedor não conta, a placa revela.<br>
              <a href="${site}" style="color:${COR.primaria600};text-decoration:none;">${site.replace(/^https?:\/\//, "")}</a>
              &nbsp;·&nbsp;
              <a href="${site}/privacidade" style="color:${COR.apagado};">Privacidade</a>
              <br><br>
              Este é um e-mail automático. Respostas a este endereço não são lidas.
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>
</body>
</html>`;
}
