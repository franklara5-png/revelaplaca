export const dynamic = "force-dynamic";

import { PeriodoSelect } from "@/components/admin/periodo-select";
import { StatCard } from "@/components/admin/stat-card";
import { GraficoBarras } from "@/components/admin/grafico-barras";
import { Card } from "@/components/ui";
import { FunilFunnel } from "@/components/admin/funil-funnel";
import { parsePeriodo } from "@/lib/admin/periodo";
import { obterFunilConversao } from "@/lib/admin/funil";
import { obterGrafico14Dias, obterMetricasDashboard } from "@/lib/admin/stats";

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ periodo?: string }>;
}) {
  const { periodo: periodoParam } = await searchParams;
  const periodo = parsePeriodo(periodoParam);
  const metricas = await obterMetricasDashboard(periodo);
  const grafico = await obterGrafico14Dias();
  const funil = await obterFunilConversao(periodo);

  const fmt = (centavos: number) =>
    (centavos / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-rp-ink">Dashboard</h1>
        <PeriodoSelect atual={periodo} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          titulo="Receita confirmada"
          valor={fmt(metricas.receitaCentavos)}
          subtitulo={`${metricas.pedidosPagos} pedidos pagos`}
        />
        <StatCard
          titulo="Consultas grátis"
          valor={String(metricas.consultasGratis)}
          subtitulo={`Conversão ${metricas.taxaConversao.toFixed(1)}%`}
        />
        <StatCard
          titulo="Cache hit"
          valor={`${metricas.taxaCacheHit.toFixed(0)}%`}
          subtitulo="Economia de fornecedor"
        />
        <StatCard
          titulo="Ticket médio"
          valor={fmt(metricas.ticketMedioCentavos)}
          subtitulo={`${metricas.pedidosPendentes} pendentes · ${metricas.pedidosExpirados} expirados`}
        />
      </div>

      <Card className="p-4">
        <h2 className="font-semibold text-rp-ink">Funil de conversão</h2>
        <p className="mt-1 text-xs text-rp-slate-500">
          Percentual entre etapas consecutivas no período selecionado.
        </p>
        <div className="mt-4">
          <FunilFunnel etapas={funil} />
        </div>
      </Card>

      <Card className="p-4">
        <h2 className="font-semibold text-rp-ink">Últimos 14 dias</h2>
        <div className="mt-4">
          <GraficoBarras dados={grafico} />
        </div>
      </Card>
    </div>
  );
}
