import Link from "next/link";
import { StatusBadge } from "@/components/ui";
import { AdminCopyLink } from "@/components/admin/admin-copy-link";
import { formatarPlaca } from "@/lib/placa";
import { urlPainelAsaas } from "@/lib/asaas";
import { getSiteUrl } from "@/lib/site-url";
import type { Pedido } from "@/lib/pedidos";
import { buscarRelatorioPorPedido } from "@/lib/relatorios";
import { reenviarEmailPedido, reprocessarRelatorioPedido } from "@/app/actions/admin-pedidos";

const STATUS_VARIANT: Record<string, "ok" | "alerta" | "desconhecido"> = {
  pago: "ok",
  pendente: "alerta",
  expirado: "desconhecido",
};

type Props = {
  pedidos: Pedido[];
  tokens: Record<string, string | null>;
};

export function PedidosTable({ pedidos, tokens }: Props) {
  return (
    <div className="overflow-x-auto rounded-[var(--rp-radius)] border border-rp-slate-100 bg-white">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-rp-slate-100 bg-rp-slate-50 text-xs uppercase text-rp-slate-500">
          <tr>
            <th className="px-4 py-3">Data</th>
            <th className="px-4 py-3">Placa</th>
            <th className="px-4 py-3">E-mail</th>
            <th className="px-4 py-3">Valor</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Pago em</th>
            <th className="px-4 py-3">Ações</th>
          </tr>
        </thead>
        <tbody>
          {pedidos.map((p) => (
            <tr key={p.id} className="border-b border-rp-slate-100 last:border-0">
              <td className="px-4 py-3 whitespace-nowrap">
                {p.criadoEm?.toLocaleString("pt-BR") ?? "—"}
              </td>
              <td className="px-4 py-3 font-mono">{formatarPlaca(p.placa)}</td>
              <td className="px-4 py-3">{p.email}</td>
              <td className="px-4 py-3">
                {(p.valorCentavos / 100).toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </td>
              <td className="px-4 py-3">
                <StatusBadge
                  variant={STATUS_VARIANT[p.status] ?? "desconhecido"}
                  label={p.status}
                />
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                {p.pagoEm?.toLocaleString("pt-BR") ?? "—"}
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-2">
                  {p.status === "pago" && (
                    <form action={reprocessarRelatorioPedido}>
                      <input type="hidden" name="pedidoId" value={p.id} />
                      <button
                        type="submit"
                        className="text-xs font-semibold text-rp-primary hover:underline"
                      >
                        Reprocessar
                      </button>
                    </form>
                  )}
                  {p.status === "pago" && tokens[p.id] && (
                    <>
                      <form action={reenviarEmailPedido}>
                        <input type="hidden" name="pedidoId" value={p.id} />
                        <button
                          type="submit"
                          className="text-xs font-semibold text-rp-primary hover:underline"
                        >
                          Reenviar e-mail
                        </button>
                      </form>
                      <AdminCopyLink
                        url={`${getSiteUrl()}/relatorio/${tokens[p.id]}`}
                      />
                    </>
                  )}
                  {p.asaasPaymentId && (
                    <Link
                      href={urlPainelAsaas(p.asaasPaymentId)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-rp-primary hover:underline"
                    >
                      Asaas ↗
                    </Link>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export async function PedidosTableWithTokens({ pedidos }: { pedidos: Pedido[] }) {
  const tokens: Record<string, string | null> = {};
  for (const p of pedidos) {
    if (p.status === "pago") {
      const rel = await buscarRelatorioPorPedido(p.id);
      tokens[p.id] = rel?.tokenAcesso ?? null;
    }
  }
  return <PedidosTable pedidos={pedidos} tokens={tokens} />;
}
