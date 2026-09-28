import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  ShieldCheck,
  CalendarClock,
  AlertTriangle,
} from "lucide-react";
import { getSession } from "@/lib/get-session";
import { getPedidosDoUsuario } from "@/lib/pedidos-usuario";
import { getConsultasDoUsuario } from "@/lib/consultas-usuario";
import { formatarPlaca } from "@/lib/placa";
import { getSeoMetadata } from "@/lib/seo";
import { LogoutButton } from "./LogoutButton";

export const metadata: Metadata = getSeoMetadata({
  title: "Minha Conta",
  description: "Painel do cliente RevelaPlaca.",
  path: "/painel",
  noindex: true,
});

// Faltando esse tanto de dias, o laudo passa a avisar que esta perto de
// vencer. O cliente que descobre que perdeu o acesso ao clicar abre chamado;
// avisado com uma semana, ele baixa ou consulta de novo antes.
const DIAS_PARA_AVISAR_VENCIMENTO = 7;

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

function formatDiaCurto(date: Date | string | null): string {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  });
}

/** Dias inteiros que faltam. Negativo quando ja passou. */
function diasAte(date: Date | string | null): number | null {
  if (!date) return null;
  const ms = new Date(date).getTime() - Date.now();
  return Math.ceil(ms / (24 * 60 * 60 * 1000));
}

function Tile({
  icone,
  valor,
  rotulo,
  destaque,
}: {
  icone: React.ReactNode;
  valor: string;
  rotulo: string;
  destaque?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border px-4 py-4 ${
        destaque
          ? "border-rp-amber-500/40 bg-rp-amber-500/5"
          : "border-rp-slate-100 bg-white"
      }`}
    >
      <div className="flex items-center gap-2 text-rp-slate-400">
        {icone}
        <span className="text-xs font-medium">{rotulo}</span>
      </div>
      <p className="mt-1.5 text-xl font-bold text-rp-ink">{valor}</p>
    </div>
  );
}

export default async function PainelPage() {
  const session = await getSession();
  if (!session?.user) redirect("/login?callbackUrl=/painel");

  const user = session.user;
  const [pedidosList, consultasList] = await Promise.all([
    getPedidosDoUsuario(user.id, user.email),
    getConsultasDoUsuario(user.id),
  ]);

  const laudosAtivos = pedidosList.filter((p) => {
    if (p.status !== "pago" || !p.tokenAcesso) return false;
    const dias = diasAte(p.expiraEm);
    return dias === null || dias > 0;
  });

  // O vencimento mais proximo entre os laudos que ainda valem: e a unica data
  // do painel que exige acao antes de uma data.
  const proximoVencimento = laudosAtivos
    .map((p) => p.expiraEm)
    .filter((d): d is Date => d !== null)
    .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())[0];

  const diasProximo = diasAte(proximoVencimento ?? null);
  const vencimentoUrgente =
    diasProximo !== null && diasProximo <= DIAS_PARA_AVISAR_VENCIMENTO;

  const contaVazia = pedidosList.length === 0 && consultasList.length === 0;

  return (
    <main className="min-h-[60vh] px-4 py-28">
      <div className="mx-auto max-w-3xl space-y-8">
        {/* Cabeçalho da conta */}
        <header className="flex items-center gap-4">
          {user.image ? (
            <img
              src={user.image}
              alt={user.name ?? ""}
              className="w-14 h-14 rounded-full border border-rp-slate-100"
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-rp-primary-600 text-white flex items-center justify-center text-lg font-bold">
              {user.name?.charAt(0)?.toUpperCase() ?? "?"}
            </div>
          )}

          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-bold text-rp-ink truncate">
              Olá, {user.name?.split(" ")[0]}!
            </h1>
            <p className="text-rp-slate-400 text-sm truncate">{user.email}</p>
          </div>

          <LogoutButton />
        </header>

        {contaVazia ? (
          /* Conta nova: em vez de dizer que nao ha nada, dizer o que fazer. */
          <section className="rounded-2xl border border-rp-slate-100 bg-white px-6 py-10 text-center">
            <Search className="w-10 h-10 text-rp-slate-400 mx-auto mb-4" />
            <h2 className="text-lg font-bold text-rp-ink">
              Sua conta ainda está vazia
            </h2>
            <p className="mt-2 text-sm text-rp-slate-600 max-w-md mx-auto">
              Consulte uma placa de graça para ver marca, modelo, ano e situação
              do veículo. As placas que você consultar ficam guardadas aqui.
            </p>
            <Link
              href="/#consultar"
              className="mt-6 inline-flex items-center gap-2 rounded-[var(--rp-radius)] bg-rp-primary-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-rp-primary-700"
            >
              <Search className="w-4 h-4" />
              Revelar placa
            </Link>
          </section>
        ) : (
          <>
            {/* Resumo */}
            <section className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <Tile
                icone={<Search className="w-4 h-4" />}
                valor={String(consultasList.length)}
                rotulo={
                  consultasList.length === 1
                    ? "placa consultada"
                    : "placas consultadas"
                }
              />
              <Tile
                icone={<ShieldCheck className="w-4 h-4" />}
                valor={String(laudosAtivos.length)}
                rotulo={
                  laudosAtivos.length === 1 ? "laudo ativo" : "laudos ativos"
                }
              />
              <Tile
                icone={<CalendarClock className="w-4 h-4" />}
                valor={
                  proximoVencimento ? formatDiaCurto(proximoVencimento) : "—"
                }
                rotulo={proximoVencimento ? "próximo vencimento" : "sem vencimento"}
                destaque={vencimentoUrgente}
              />
            </section>

            {/* Laudos */}
            <section>
              <h2 className="text-lg font-bold text-rp-ink mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-rp-slate-400" />
                Seus laudos
              </h2>

              {pedidosList.length === 0 ? (
                <div className="rounded-2xl border border-rp-slate-100 bg-white px-6 py-8 text-center">
                  <p className="text-sm text-rp-slate-600">
                    Você ainda não comprou nenhum laudo completo.
                  </p>
                  <p className="mt-1 text-xs text-rp-slate-400">
                    O laudo mostra leilão, sinistro, roubo, gravame e restrições.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pedidosList.map((pedido) => {
                    const dias = diasAte(pedido.expiraEm);
                    const expirado = dias !== null && dias <= 0;
                    const perto =
                      dias !== null &&
                      dias > 0 &&
                      dias <= DIAS_PARA_AVISAR_VENCIMENTO;
                    const disponivel =
                      pedido.status === "pago" &&
                      Boolean(pedido.tokenAcesso) &&
                      !expirado;

                    return (
                      <div
                        key={pedido.id}
                        className="flex items-center justify-between rounded-2xl border border-rp-slate-100 bg-white px-5 py-4 transition-colors hover:border-rp-slate-400/40"
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-rp-primary-50 flex items-center justify-center flex-shrink-0">
                            {STATUS_ICONS[pedido.status] ?? (
                              <Clock className="w-4 h-4 text-rp-slate-400" />
                            )}
                          </div>

                          <div className="min-w-0">
                            <p className="font-semibold text-rp-ink">
                              {formatarPlaca(pedido.placa)}
                            </p>
                            <p className="text-xs text-rp-slate-400">
                              {formatDate(pedido.criadoEm)}
                              {" · "}
                              {(pedido.valorCentavos / 100).toLocaleString(
                                "pt-BR",
                                { style: "currency", currency: "BRL" },
                              )}
                              {" · "}
                              <span className="font-medium">
                                {STATUS_LABELS[pedido.status] ?? pedido.status}
                              </span>
                            </p>

                            {/* Validade: so aparece quando ha laudo com prazo. */}
                            {pedido.tokenAcesso && dias !== null && (
                              <p
                                className={`mt-1 text-xs font-medium flex items-center gap-1 ${
                                  expirado
                                    ? "text-rp-red-500"
                                    : perto
                                      ? "text-rp-amber-500"
                                      : "text-rp-slate-400"
                                }`}
                              >
                                {(expirado || perto) && (
                                  <AlertTriangle className="w-3 h-3" />
                                )}
                                {expirado
                                  ? "Acesso expirado"
                                  : perto
                                    ? `Expira em ${dias} ${dias === 1 ? "dia" : "dias"}`
                                    : `Disponível até ${formatDiaCurto(pedido.expiraEm)}`}
                              </p>
                            )}
                          </div>
                        </div>

                        {disponivel ? (
                          <Link
                            href={`/relatorio/${pedido.tokenAcesso}`}
                            className="flex items-center gap-1.5 text-sm font-semibold text-rp-primary-600 hover:underline flex-shrink-0 ml-3"
                          >
                            <FileText className="w-4 h-4" />
                            <span className="hidden sm:inline">Ver laudo</span>
                          </Link>
                        ) : pedido.status === "pendente" ? (
                          <Link
                            href={`/checkout/${pedido.placa}?pedido=${pedido.id}`}
                            className="text-sm font-semibold text-rp-amber-500 hover:underline flex-shrink-0 ml-3"
                          >
                            Continuar
                          </Link>
                        ) : expirado ? (
                          <Link
                            href={`/checkout/${pedido.placa}`}
                            className="text-sm font-semibold text-rp-primary-600 hover:underline flex-shrink-0 ml-3"
                          >
                            Comprar de novo
                          </Link>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Placas consultadas */}
            {consultasList.length > 0 && (
              <section>
                <h2 className="text-lg font-bold text-rp-ink mb-4 flex items-center gap-2">
                  <Search className="w-5 h-5 text-rp-slate-400" />
                  Placas que você consultou
                </h2>

                <div className="space-y-3">
                  {consultasList.map((consulta) => (
                    <div
                      key={consulta.placa}
                      className="flex items-center justify-between rounded-2xl border border-rp-slate-100 bg-white px-5 py-4 transition-colors hover:border-rp-slate-400/40"
                    >
                      <div className="min-w-0">
                        <p className="font-semibold text-rp-ink">
                          {formatarPlaca(consulta.placa)}
                          {consulta.marca ? (
                            <span className="font-normal text-rp-slate-600">
                              {" · "}
                              {consulta.marca} {consulta.modelo}
                              {consulta.anoModelo ? ` ${consulta.anoModelo}` : ""}
                            </span>
                          ) : null}
                        </p>
                        <p className="text-xs text-rp-slate-400">
                          {formatDate(consulta.ultimaEm)}
                          {consulta.vezes > 1
                            ? ` · ${consulta.vezes} consultas`
                            : ""}
                        </p>
                      </div>

                      <Link
                        href={`/consulta/${consulta.placa}`}
                        className="text-sm font-semibold text-rp-primary-600 hover:underline flex-shrink-0 ml-3"
                      >
                        Ver de novo
                      </Link>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </main>
  );
}
