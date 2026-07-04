import "server-only";

export type EmailMensagem = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

export async function sendEmail(mensagem: EmailMensagem): Promise<boolean> {
  const apiKey = process.env.BREVO_API_KEY;

  if (!apiKey) {
    console.info("[email] BREVO_API_KEY não configurada — log apenas:");
    console.info(`  Para: ${mensagem.to}`);
    console.info(`  Assunto: ${mensagem.subject}`);
    console.info(`  Texto: ${mensagem.text ?? mensagem.html.slice(0, 200)}`);
    return true;
  }

  try {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify({
        sender: {
          name: process.env.BREVO_SENDER_NAME ?? "RevelaPlaca",
          email: process.env.BREVO_SENDER_EMAIL ?? "noreply@revelaplaca.com.br",
        },
        to: [{ email: mensagem.to }],
        subject: mensagem.subject,
        htmlContent: mensagem.html,
        textContent: mensagem.text,
      }),
      signal: AbortSignal.timeout(10_000),
    });

    if (!res.ok) {
      console.error("[email] Brevo HTTP", res.status, await res.text());
      return false;
    }

    return true;
  } catch (erro) {
    console.error("[email] erro ao enviar:", erro);
    return false;
  }
}
