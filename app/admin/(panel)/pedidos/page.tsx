export const dynamic = "force-dynamic";

import Link from "next/link";
import { PedidosTableWithTokens } from "@/components/admin/pedidos-table";
import { Card, Input } from "@/components/ui";
import { listarPedidosAdmin } from "@/lib/admin/stats";

export default async function AdminPedidosPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; busca?: string; pagina?: string }>;
}) {
  const params = await searchParams;
  const pagina = Math.max(1, Number(params.pagina ?? 1));
  const { pedidos, total } = await listarPedidosAdmin({
    pagina,
    porPagina: 20,
    status: params.status,
    busca: params.busca,
  });
  const totalPaginas = Math.max(1, Math.ceil(total / 20));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-rp-ink">Pedidos</h1>

      <Card className="p-4">
        <form method="get" action="/admin/pedidos" className="flex flex-wrap gap-3">
          <Input
            name="busca"
            placeholder="Placa ou e-mail"
            defaultValue={params.busca}
            className="max-w-xs normal-case tracking-normal"
          />
          <select
            name="status"
            defaultValue={params.status ?? ""}
            className="rounded-xl border border-rp-slate-100 px-3 py-2 text-sm"
          >
            <option value="">Todos os status</option>
            <option value="pendente">Pendente</option>
            <option value="pago">Pago</option>
          </select>
          <button
            type="submit"
            className="rounded-xl bg-rp-primary-900 px-4 py-2 text-sm font-semibold text-white"
          >
            Filtrar
          </button>
        </form>
      </Card>

      {pedidos.length === 0 ? (
        <p className="text-sm text-rp-slate-600">Nenhum pedido encontrado.</p>
      ) : (
        <PedidosTableWithTokens pedidos={pedidos} />
      )}

      <div className="flex gap-2 text-sm">
        {pagina > 1 && (
          <Link
            href={`/admin/pedidos?pagina=${pagina - 1}&status=${params.status ?? ""}&busca=${params.busca ?? ""}`}
            className="text-rp-primary hover:underline"
          >
            ← Anterior
          </Link>
        )}
        <span className="text-rp-slate-600">
          Página {pagina} de {totalPaginas}
        </span>
        {pagina < totalPaginas && (
          <Link
            href={`/admin/pedidos?pagina=${pagina + 1}&status=${params.status ?? ""}&busca=${params.busca ?? ""}`}
            className="text-rp-primary hover:underline"
          >
            Próxima →
          </Link>
        )}
      </div>
    </div>
  );
}
