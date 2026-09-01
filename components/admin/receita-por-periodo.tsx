import { Card } from "@/components/ui";
import { GraficoReceitaMensal } from "@/components/admin/grafico-receita-mensal";
import type { ReceitaAno, ReceitaMes } from "@/lib/admin/stats";

type Props = {
  porMes: ReceitaMes[];
  porAno: ReceitaAno[];
};

function fmtBRL(centavos: number) {
  return (centavos / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function ReceitaPorPeriodo({ porMes, porAno }: Props) {
  const grafico = [...porMes].reverse();

  return (
    <Card className="p-4">
      <h2 className="font-semibold text-rp-ink">Receita por período</h2>
      <p className="mt-1 text-xs text-rp-slate-500">
        Pedidos com status pago, agrupados por mês/ano de pagamento.
      </p>

      <div className="mt-4">
        <GraficoReceitaMensal
          dados={grafico.map((m) => ({
            label: m.label,
            receitaCentavos: m.receitaCentavos,
          }))}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div>
          <h3 className="mb-2 text-sm font-semibold text-rp-ink">Por mês</h3>
          <div className="overflow-x-auto rounded-[var(--rp-radius)] border border-rp-slate-100 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-rp-slate-100 bg-rp-slate-50 text-xs uppercase text-rp-slate-500">
                <tr>
                  <th className="px-4 py-3">Mês</th>
                  <th className="px-4 py-3">Pedidos</th>
                  <th className="px-4 py-3">Receita</th>
                  <th className="px-4 py-3">Ticket médio</th>
                </tr>
              </thead>
              <tbody>
                {porMes.map((m) => (
                  <tr key={m.chave} className="border-b border-rp-slate-100 last:border-0">
                    <td className="px-4 py-3 whitespace-nowrap capitalize">{m.label}</td>
                    <td className="px-4 py-3">{m.pedidos}</td>
                    <td className="px-4 py-3">{fmtBRL(m.receitaCentavos)}</td>
                    <td className="px-4 py-3">{fmtBRL(m.ticketMedioCentavos)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h3 className="mb-2 text-sm font-semibold text-rp-ink">Por ano</h3>
          <div className="overflow-x-auto rounded-[var(--rp-radius)] border border-rp-slate-100 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-rp-slate-100 bg-rp-slate-50 text-xs uppercase text-rp-slate-500">
                <tr>
                  <th className="px-4 py-3">Ano</th>
                  <th className="px-4 py-3">Pedidos</th>
                  <th className="px-4 py-3">Receita</th>
                  <th className="px-4 py-3">Ticket médio</th>
                </tr>
              </thead>
              <tbody>
                {porAno.map((a) => (
                  <tr key={a.ano} className="border-b border-rp-slate-100 last:border-0">
                    <td className="px-4 py-3 whitespace-nowrap">{a.ano}</td>
                    <td className="px-4 py-3">{a.pedidos}</td>
                    <td className="px-4 py-3">{fmtBRL(a.receitaCentavos)}</td>
                    <td className="px-4 py-3">{fmtBRL(a.ticketMedioCentavos)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Card>
  );
}
