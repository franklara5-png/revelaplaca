export const dynamic = "force-dynamic";

import { Card } from "@/components/ui";
import {
  listarConsultasRecentes,
  topOrigensConsultas,
  topPlacasConsultadas,
} from "@/lib/admin/stats";
import { formatarPlaca } from "@/lib/placa";

export default async function AdminConsultasPage() {
  const [recentes, topPlacas, topOrigens] = await Promise.all([
    listarConsultasRecentes(50),
    topPlacasConsultadas(),
    topOrigensConsultas(),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-rp-ink">Consultas</h1>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-4">
          <h2 className="font-semibold text-rp-ink">Top placas (30 dias)</h2>
          <ol className="mt-4 space-y-2 text-sm">
            {topPlacas.map((item, i) => (
              <li key={item.placa} className="flex justify-between">
                <span>
                  {i + 1}. {formatarPlaca(item.placa)}
                </span>
                <span className="text-rp-slate-600">{item.total}</span>
              </li>
            ))}
          </ol>
        </Card>

        <Card className="p-4">
          <h2 className="font-semibold text-rp-ink">Top origens UTM (30 dias)</h2>
          <ol className="mt-4 space-y-2 text-sm">
            {topOrigens.map((item, i) => (
              <li key={item.origem ?? "direto"} className="flex justify-between">
                <span>{i + 1}. {item.origem ?? "(direto)"}</span>
                <span className="text-rp-slate-600">{item.total}</span>
              </li>
            ))}
          </ol>
        </Card>
      </div>

      <Card className="overflow-x-auto p-0">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-rp-slate-100 bg-rp-slate-50 text-xs uppercase text-rp-slate-500">
            <tr>
              <th className="px-4 py-3">Data</th>
              <th className="px-4 py-3">Placa</th>
              <th className="px-4 py-3">Cache</th>
              <th className="px-4 py-3">Origem</th>
            </tr>
          </thead>
          <tbody>
            {recentes.map((c) => (
              <tr key={c.id} className="border-b border-rp-slate-100">
                <td className="px-4 py-3 whitespace-nowrap">
                  {c.criadaEm?.toLocaleString("pt-BR") ?? "—"}
                </td>
                <td className="px-4 py-3 font-mono">{formatarPlaca(c.placa)}</td>
                <td className="px-4 py-3">{c.cacheHit ? "Hit" : "Miss"}</td>
                <td className="px-4 py-3">{c.origem ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
