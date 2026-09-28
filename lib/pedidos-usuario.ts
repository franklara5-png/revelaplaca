import { desc, eq, or } from "drizzle-orm";
import { getDb } from "@/db";
import { pedidos, relatorios } from "@/db/schema";

/**
 * Pedidos que pertencem ao usuario: os ligados a conta (user_id) MAIS os que
 * batem pelo e-mail.
 *
 * O OR nao e redundancia. Antes a busca era so por e-mail, e o e-mail do
 * pedido vem do formulario do checkout — quem pagasse com outro endereco
 * nao via o proprio laudo no painel. Agora quem compra logado fica ligado
 * pelo id; o ramo do e-mail continua para nao perder quem comprou deslogado,
 * antes de existir user_id, ou com a conta ainda nao criada.
 */
export async function getPedidosDoUsuario(
  userId: string,
  email: string,
  emailVerificado: boolean,
) {
  const db = getDb();

  // Casar por e-mail so vale quando o endereco foi comprovado. Com cadastro
  // proprio aberto, alguem poderia se registrar com o e-mail de outra pessoa
  // e, sem esta trava, ver os laudos pagos dela. O bloqueio principal e o
  // requireEmailVerification do better-auth; este aqui e independente dele,
  // para o furo nao voltar se aquela opcao mudar.
  const filtro = emailVerificado
    ? or(eq(pedidos.userId, userId), eq(pedidos.email, email))
    : eq(pedidos.userId, userId);

  const rows = await db
    .select({
      id: pedidos.id,
      placa: pedidos.placa,
      status: pedidos.status,
      valorCentavos: pedidos.valorCentavos,
      criadoEm: pedidos.criadoEm,
      pagoEm: pedidos.pagoEm,
      tokenAcesso: relatorios.tokenAcesso,
      expiraEm: relatorios.expiraEm,
    })
    .from(pedidos)
    .leftJoin(relatorios, eq(pedidos.id, relatorios.pedidoId))
    .where(filtro)
    .orderBy(desc(pedidos.criadoEm))
    .limit(50);

  return rows;
}
