import "server-only";

import { and, eq, ne } from "drizzle-orm";
import { nanoid } from "nanoid";
import { getDb } from "@/db";
import { pedidos, relatorios } from "@/db/schema";
import { sendEmail } from "@/lib/email";
import { fornecedorPremium } from "@/lib/fornecedores/premium";
import { sanitizarDados } from "@/lib/fornecedores/sanitize";
import { buscarPedido } from "@/lib/pedidos";
import { formatarPlaca } from "@/lib/placa";
import { getSiteUrl, SITE_NAME } from "@/lib/site-url";
import { registrarEvento } from "@/lib/eventos";

const TTL_ACESSO_DIAS = 90;
const MAX_TENTATIVAS = 3;
const BACKOFF_MS = [0, 2_000, 4_000];

export type Relatorio = typeof relatorios.$inferSelect;

function calcularExpiracaoAcesso(): Date {
  const expira = new Date();
  expira.setDate(expira.getDate() + TTL_ACESSO_DIAS);
  return expira;
}

function linkRelatorio(token: string): string {
  return `${getSiteUrl()}/relatorio/${token}`;
}

export async function buscarRelatorioPorToken(
  token: string,
): Promise<Relatorio | null> {
  const [relatorio] = await getDb()
    .select()
    .from(relatorios)
    .where(eq(relatorios.tokenAcesso, token))
    .limit(1);

  if (!relatorio) return null;
  if (relatorio.expiraEm && relatorio.expiraEm.getTime() < Date.now()) return null;

  return relatorio;
}

export async function buscarRelatorioPorPedido(
  pedidoId: string,
): Promise<Relatorio | null> {
  const [relatorio] = await getDb()
    .select()
    .from(relatorios)
    .where(eq(relatorios.pedidoId, pedidoId))
    .limit(1);

  return relatorio ?? null;
}

async function enviarEmailRelatorio(
  email: string,
  placa: string,
  token: string,
) {
  const url = linkRelatorio(token);
  const placaFmt = formatarPlaca(placa);

  await sendEmail({
    to: email,
    subject: `Seu relatório veicular — placa ${placaFmt}`,
    html: `
      <p>Olá,</p>
      <p>Seu pagamento foi confirmado. O relatório completo da placa <strong>${placaFmt}</strong> está disponível:</p>
      <p><a href="${url}">${url}</a></p>
      <p>O link permanece ativo por ${TTL_ACESSO_DIAS} dias.</p>
      <p>— ${SITE_NAME}</p>
    `,
    text: `Relatório da placa ${placaFmt}: ${url}`,
  });
}

async function enviarEmailFalhaRelatorio(email: string, placa: string) {
  const placaFmt = formatarPlaca(placa);

  await sendEmail({
    to: email,
    subject: `Pagamento confirmado — relatório em processamento (${placaFmt})`,
    html: `
      <p>Olá,</p>
      <p>Recebemos seu pagamento referente à placa <strong>${placaFmt}</strong>, mas ainda não conseguimos gerar o relatório completo automaticamente.</p>
      <p>Nossa equipe foi notificada e você receberá um novo e-mail assim que o relatório estiver pronto. Não é necessário pagar novamente.</p>
      <p>— ${SITE_NAME}</p>
    `,
    text: `Pagamento da placa ${placaFmt} confirmado. Relatório em processamento.`,
  });
}

async function consultarComBackoff(placa: string) {
  for (let i = 0; i < MAX_TENTATIVAS; i++) {
    if (BACKOFF_MS[i] > 0) {
      await new Promise((r) => setTimeout(r, BACKOFF_MS[i]));
    }

    const resultado = await fornecedorPremium.consultar(placa);
    if (resultado) return resultado;
  }

  return null;
}

export async function gerarRelatorioParaPedido(
  pedidoId: string,
): Promise<{ token: string } | null> {
  const existente = await buscarRelatorioPorPedido(pedidoId);
  if (existente) return { token: existente.tokenAcesso };

  const pedido = await buscarPedido(pedidoId);
  if (!pedido || pedido.status !== "pago") return null;

  const dadosPremium = await consultarComBackoff(pedido.placa);
  if (!dadosPremium) {
    await enviarEmailFalhaRelatorio(pedido.email, pedido.placa);
    return null;
  }

  const token = nanoid(32);
  const expiraEm = calcularExpiracaoAcesso();
  const dadosSanitizados = sanitizarDados({
    ...dadosPremium,
    _meta: {
      fonte: process.env.FORNECEDOR_PREMIUM_NOME ?? "Parceiro veicular autorizado",
      consultadoEm: new Date().toISOString(),
      indisponivel: (["leilao", "sinistro", "rouboFurto", "gravame", "restricoes", "debitos"] as const).filter(
        (k) => dadosPremium[k] === undefined,
      ),
    },
  }) as Record<string, unknown>;

  const [relatorio] = await getDb()
    .insert(relatorios)
    .values({
      pedidoId: pedido.id,
      placa: pedido.placa,
      dados: dadosSanitizados,
      tokenAcesso: token,
      expiraEm,
    })
    .returning();

  await enviarEmailRelatorio(pedido.email, pedido.placa, relatorio.tokenAcesso);

  return { token: relatorio.tokenAcesso };
}

export async function processarPagamentoConfirmado(
  pedidoId: string,
): Promise<{ token: string | null; jaPago: boolean }> {
  const pedido = await buscarPedido(pedidoId);
  if (!pedido) return { token: null, jaPago: false };

  // A transicao para "pago" precisa ser ATOMICA.
  //
  // A Asaas reenvia webhook por desenho. Com a versao anterior — ler o status,
  // depois gravar — duas entregas simultaneas passavam as duas pela checagem,
  // gravavam as duas e chamavam gerarRelatorioParaPedido as duas vezes. E ali
  // dentro esta `consultarComBackoff`, que e a chamada PAGA ao fornecedor
  // premium. O resultado seria: dois relatorios para o mesmo pedido, dois
  // e-mails para o cliente e a consulta paga DUAS vezes por uma venda so.
  //
  // O UPDATE condicional resolve no banco: so uma das entregas encontra o
  // pedido ainda nao-pago, e so ela gera. As demais caem no ramo de leitura.
  const marcados = await getDb()
    .update(pedidos)
    .set({ status: "pago", pagoEm: new Date() })
    .where(and(eq(pedidos.id, pedidoId), ne(pedidos.status, "pago")))
    .returning({ id: pedidos.id });

  const euMarquei = marcados.length > 0;

  if (!euMarquei) {
    // Ja estava pago (ou outra entrega ganhou a corrida agora).
    const relatorio = await buscarRelatorioPorPedido(pedidoId);
    if (relatorio) {
      return { token: relatorio.tokenAcesso, jaPago: true };
    }
    // Pago sem relatorio: pode ser a corrida ainda em curso na outra entrega,
    // ou uma geracao que falhou antes. gerarRelatorioParaPedido tem a propria
    // checagem de existente, entao e seguro chamar.
    const gerado = await gerarRelatorioParaPedido(pedidoId);
    return { token: gerado?.token ?? null, jaPago: true };
  }

  void registrarEvento("pagamento_confirmado", { placa: pedido.placa });

  const gerado = await gerarRelatorioParaPedido(pedidoId);
  return { token: gerado?.token ?? null, jaPago: false };
}

export function relatorioValido(relatorio: Relatorio): boolean {
  if (!relatorio.expiraEm) return true;
  return relatorio.expiraEm.getTime() > Date.now();
}

export async function buscarRelatorioValidoPorToken(
  token: string,
): Promise<Relatorio | null> {
  const relatorio = await buscarRelatorioPorToken(token);
  if (!relatorio || !relatorioValido(relatorio)) return null;
  return relatorio;
}

export async function reenviarEmailRelatorio(pedidoId: string): Promise<boolean> {
  const pedido = await buscarPedido(pedidoId);
  if (!pedido || pedido.status !== "pago") return false;

  const relatorio = await buscarRelatorioPorPedido(pedidoId);
  if (!relatorio) return false;

  await enviarEmailRelatorio(pedido.email, pedido.placa, relatorio.tokenAcesso);
  return true;
}
