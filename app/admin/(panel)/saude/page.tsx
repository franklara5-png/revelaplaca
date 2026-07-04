export const dynamic = "force-dynamic";

import Link from "next/link";
import { HealthTestButtons } from "@/components/admin/health-test-buttons";
import { Card } from "@/components/ui";
import { checarEnvs } from "@/lib/admin/saude";
import { contarPagosSemRelatorio } from "@/lib/admin/stats";

export default async function AdminSaudePage() {
  const envs = checarEnvs();
  const semRelatorio = await contarPagosSemRelatorio();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-rp-ink">Saúde</h1>

      {semRelatorio > 0 && (
        <div className="rounded-2xl border border-rp-danger/30 bg-rp-danger/10 px-4 py-3 text-sm text-rp-danger">
          <strong>{semRelatorio} pedido(s) pago(s) sem relatório.</strong>{" "}
          <Link href="/admin/pedidos?status=pago" className="underline">
            Ver pedidos →
          </Link>
        </div>
      )}

      <Card className="p-4">
        <h2 className="font-semibold text-rp-ink">Variáveis de ambiente</h2>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {envs.map((e) => (
            <li key={e.nome} className="flex items-center gap-2 text-sm">
              <span aria-hidden>{e.definida ? "✓" : "✗"}</span>
              <span className={e.definida ? "text-rp-ink" : "text-rp-danger"}>
                {e.nome}
              </span>
            </li>
          ))}
        </ul>
      </Card>

      <Card className="p-4">
        <h2 className="mb-4 font-semibold text-rp-ink">Fornecedores</h2>
        <HealthTestButtons />
      </Card>

      <Card className="p-4">
        <h2 className="font-semibold text-rp-ink">Relatórios</h2>
        <p className="mt-2 text-sm text-rp-slate-600">
          Pedidos pagos sem relatório:{" "}
          <span
            className={
              semRelatorio === 0 ? "font-semibold text-rp-success" : "font-semibold text-rp-danger"
            }
          >
            {semRelatorio}
          </span>
        </p>
      </Card>
    </div>
  );
}
