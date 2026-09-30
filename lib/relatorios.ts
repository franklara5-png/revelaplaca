import "server-only";

import { and, eq, isNull, lt, ne, or } from "drizzle-orm";
import { nanoid } from "nanoid";
import { getDb } from "@/db";
import { pedidos, relatorios } from "@/db/schema";
import { sendEmail } from "@/lib/email";
import { fornecedorPremium } from "@/lib/fornecedores/premium";
import { sanitizarDados } from "@/lib/fornecedores/sanitize";
import { buscarPedido } from "@/lib/pedidos";
import { formatarPlaca } from "@/lib/placa";
import { getSiteUrl } from "@/lib/site-url";
import { registrarEvento } from "@/lib/eventos";
import {
  emailRelatorioPronto,
  emailRelatorioProcessando,
} from "@/lib/email-templates/pedidos";

const TTL_ACESSO_DIAS = 90;
// Nao ha mais retentativa do relatorio INTEIRO aqui. Ela repetia todas as
// secoes 3 vezes, e com fornecedor que cobra por item isso pagava de novo o
// que ja tinha vindo. Quem tenta de novo agora e o adaptador, e so o item
// que falhou (lib/fornecedores/premium.ts).

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
    ...emailRelatorioPronto(url, placaFmt, TTL_ACESSO_DIAS),
  });
}

async function enviarEmailFalhaRelatorio(email: string, placa: string) {
  await sendEmail({
    to: email,
    ...emailRelatorioProcessando(formatarPlaca(placa)),
  });
}

// Janela da trava de geracao. Maior que o tempo maximo de uma funcao (300s),
// para uma geracao viva nunca ser atropelada; e e tambem o intervalo minimo
// entre retentativas automaticas depois de uma falha.
const JANELA_TRAVA_MS = 10 * 60 * 1000;

/**
 * Tenta ficar com a vez de gerar o relatorio deste pedido. So um chamador
 * ganha: o UPDATE e condicional, entao duas chamadas simultaneas nao passam as
 * duas. Uma trava mais velha que a janela e considerada abandonada (funcao
 * que morreu no meio) e pode ser retomada.
 */
async function pegarTravaGeracao(pedidoId: string): Promise<boolean> {
  const limite = new Date(Date.now() - JANELA_TRAVA_MS);
  const pegos = await getDb()
    .update(pedidos)
    .set({ relatorioGerandoEm: new Date() })
    .where(
      and(
        eq(pedidos.id, pedidoId),
        or(
          isNull(pedidos.relatorioGerandoEm),
          lt(pedidos.relatorioGerandoEm, limite),
        ),
      ),
    )
    .returning({ id: pedidos.id });

  return pegos.length > 0;
}

async function soltarTravaGeracao(pedidoId: string) {
  await getDb()
    .update(pedidos)
    .set({ relatorioGerandoEm: null })
    .where(eq(pedidos.id, pedidoId));
}

/** Marca o aviso de falha como enviado; devolve true so para quem marcou. */
async function marcarEmailFalhaEnviado(pedidoId: string): Promise<boolean> {
  const marcados = await getDb()
    .update(pedidos)
    .set({ emailFalhaRelatorioEnviado: true })
    .where(
      and(eq(pedidos.id, pedidoId), eq(pedidos.emailFalhaRelatorioEnviado, false)),
    )
    .returning({ id: pedidos.id });

  return marcados.length > 0;
}

/**
 * Gera o relatorio pago de um pedido. Devolve o token, ou null quando ainda
 * nao ha relatorio — seja porque outra chamada esta gerando agora, seja
 * porque o fornecedor falhou.
 *
 * Chamada pelo webhook do Asaas, pela pagina de checkout (que pergunta o
 * status a cada poucos segundos) e pelo admin. Por isso a trava: a consulta
 * ao fornecedor e PAGA e pode levar minutos.
 */
export async function gerarRelatorioParaPedido(
  pedidoId: string,
): Promise<{ token: string } | null> {
  const existente = await buscarRelatorioPorPedido(pedidoId);
  if (existente) return { token: existente.tokenAcesso };

  const pedido = await buscarPedido(pedidoId);
  if (!pedido || pedido.status !== "pago") return null;

  if (!(await pegarTravaGeracao(pedidoId))) return null;

  // Sucesso solta a trava; falha a MANTEM, para a proxima tentativa
  // automatica so acontecer depois da janela — e nao a cada pergunta da
  // pagina de checkout, pagando o fornecedor de novo a cada uma.
  let soltarAoFim = true;

  try {
    // Outra geracao pode ter terminado entre a primeira checagem e a trava.
    const jaGerado = await buscarRelatorioPorPedido(pedidoId);
    if (jaGerado) return { token: jaGerado.tokenAcesso };

    const dadosPremium = await fornecedorPremium.consultar(pedido.placa);
    if (!dadosPremium) {
      soltarAoFim = false;
      if (await marcarEmailFalhaEnviado(pedidoId)) {
        await enviarEmailFalhaRelatorio(pedido.email, pedido.placa);
      }
      return null;
    }

    return await gravarRelatorio(pedido, dadosPremium);
  } finally {
    if (soltarAoFim) await soltarTravaGeracao(pedidoId);
  }
}

async function gravarRelatorio(
  pedido: NonNullable<Awaited<ReturnType<typeof buscarPedido>>>,
  dadosPremium: NonNullable<Awaited<ReturnType<typeof fornecedorPremium.consultar>>>,
): Promise<{ token: string }> {

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

/**
 * Marca o pedido como pago e devolve se ESTA chamada marcou.
 *
 * A transicao para "pago" precisa ser ATOMICA. A Asaas reenvia webhook por
 * desenho; lendo o status e depois gravando, duas entregas simultaneas
 * passavam as duas pela checagem e contavam o pagamento duas vezes. O UPDATE
 * condicional resolve no banco: so uma entrega encontra o pedido ainda
 * nao-pago.
 *
 * Nao gera o relatorio. Gerar pode levar minutos (o leilao processa fotos), e
 * o webhook precisa responder ao Asaas na hora — quem chama agenda a geracao
 * para depois da resposta. Reenvio do webhook nao duplica a consulta paga: a
 * trava em gerarRelatorioParaPedido garante uma geracao por pedido.
 */
export async function marcarPedidoComoPago(pedidoId: string): Promise<boolean> {
  const pedido = await buscarPedido(pedidoId);
  if (!pedido) return false;

  const marcados = await getDb()
    .update(pedidos)
    .set({ status: "pago", pagoEm: new Date() })
    .where(and(eq(pedidos.id, pedidoId), ne(pedidos.status, "pago")))
    .returning({ id: pedidos.id });

  const euMarquei = marcados.length > 0;
  if (euMarquei) {
    void registrarEvento("pagamento_confirmado", { placa: pedido.placa });
  }
  return euMarquei;
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
