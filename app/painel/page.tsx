import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { FileText, Clock, CheckCircle, XCircle, ShoppingCart, AlertCircle } from "lucide-react";
import { getSession } from "@/lib/get-session";
import { getPedidosPorEmail } from "@/lib/pedidos-usuario";
import { formatarPlaca } from "@/lib/placa";
import { PRECO_RELATORIO_REAIS } from "@/lib/constants/pagamento";
import { LogoutButton } from "./LogoutButton";

export const metadata: Metadata = {
  title: "Minha Conta",
  robots: { index: false, follow: false },
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
  pendente: <Clock className="w-4 h-4 text-rp-amber-500" />,
  pago: <CheckCircle className="w-4 h-4 text-rp-emerald-500" />,
  cancelado: <XCircle className="w-4 h-4 text-rp-red-500" />,
  reembolsado: <XCircle className="w-4 h-4 text-rp-slate-400" />,
};

const STATUS_LABELS: Record<string, string> = {
  pendente: "Pendente",
  pago: "Pago",
  cancelado: "Cancelado",
  reembolsado: "Reembolsado",
};

function formatDate(date: Date | string | null): string {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function PainelPage() {
  const session = await getSession();
  if (!session?.user) redirect("/login?callbackUrl=/painel");

  const user = session.user;
  const pedidosList = await getPedidosPorEmail(user.email);

  return (
    <main className="min-h-[60vh] px-4 py-28">
      <div className="mx-auto max-w-2xl space-y-8">
        {/* Perfil */}
        <div className="text-center space-y-3">
          {user.image ? (
            <img
              src={user.image}
              alt={user.name ?? ""}
              className="w-16 h-16 rounded-full mx-auto border-2 border-rp-slate-200"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-rp-primary text-white flex items-center justify-center text-xl font-bold mx-auto">
              {user.name?.charAt(0)?.toUpperCase() ?? "?"}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-rp-ink">
              Olá, {user.name?.split(" ")[0]}!
            </h1>
            <p className="text-rp-slate-500 text-sm">{user.email}</p>
          </div>
          <LogoutButton />
        </div>

        {/* Histórico de pedidos */}
        <section>
          <h2 className="text-lg font-bold text-rp-ink mb-4 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-rp-slate-400" />
            Seus pedidos
          </h2>

          {pedidosList.length === 0 ? (
            <div className="bg-rp-slate-50 rounded-2xl p-8 text-center border border-rp-slate-100">
              <AlertCircle className="w-10 h-10 text-rp-slate-300 mx-auto mb-3" />
              <p className="text-rp-slate-500 text-sm">
                Nenhum pedido encontrado. Ao comprar um relatório, ele aparece aqui automaticamente.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {pedidosList.map((pedido) => (
                <div
                  key={pedido.id}
                  className="flex items-center justify-between bg-white border border-rp-slate-100 rounded-2xl px-5 py-4 hover:border-rp-slate-200 transition-colors"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-rp-primary-50 flex items-center justify-center flex-shrink-0">
                      {STATUS_ICONS[pedido.status] ?? <Clock className="w-4 h-4 text-rp-slate-400" />}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-rp-ink">
                        Placa {formatarPlaca(pedido.placa)}
                      </p>
                      <p className="text-xs text-rp-slate-400">
                        {formatDate(pedido.criadoEm)}
                        {" · "}
                        {(pedido.valorCentavos / 100).toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                        {" · "}
                        <span className="font-medium">
                          {STATUS_LABELS[pedido.status] ?? pedido.status}
                        </span>
                      </p>
                    </div>
                  </div>

                  {pedido.tokenAcesso && pedido.status === "pago" ? (
                    <Link
                      href={`/relatorio/${pedido.tokenAcesso}`}
                      className="flex items-center gap-1.5 text-sm font-semibold text-rp-primary hover:underline flex-shrink-0 ml-3"
                    >
                      <FileText className="w-4 h-4" />
                      <span className="hidden sm:inline">Ver laudo</span>
                    </Link>
                  ) : pedido.status === "pendente" ? (
                    <Link
                      href={`/checkout/${pedido.placa}?pedido=${pedido.id}`}
                      className="text-sm font-semibold text-rp-amber-600 hover:underline flex-shrink-0 ml-3"
                    >
                      Continuar
                    </Link>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
