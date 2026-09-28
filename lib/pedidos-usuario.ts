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
export async function getPedidosDoUsuario(userId: string, email: string) {
  const db = getDb();
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
    .where(or(eq(pedidos.userId, userId), eq(pedidos.email, email)))
    .orderBy(desc(pedidos.criadoEm))
    .limit(50);

  return rows;
}
