import { eq, desc } from "drizzle-orm";
import { getDb } from "@/db";
import { pedidos, relatorios } from "@/db/schema";
import { formatarPlaca } from "@/lib/placa";
import { PRECO_RELATORIO_REAIS } from "@/lib/constants/pagamento";

export async function getPedidosPorEmail(email: string) {
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
    })
    .from(pedidos)
    .leftJoin(relatorios, eq(pedidos.id, relatorios.pedidoId))
    .where(eq(pedidos.email, email))
    .orderBy(desc(pedidos.criadoEm))
    .limit(50);

  return rows;
}
