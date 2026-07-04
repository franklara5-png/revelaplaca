import { labelDia } from "@/lib/admin/periodo";

type Ponto = {
  data: Date;
  consultas: number;
  vendas: number;
};

type Props = {
  dados: Ponto[];
};

export function GraficoBarras({ dados }: Props) {
  const max = Math.max(1, ...dados.flatMap((d) => [d.consultas, d.vendas]));

  return (
    <div className="overflow-x-auto">
      <svg
        viewBox={`0 0 ${dados.length * 48} 160`}
        className="h-40 w-full min-w-[480px]"
        role="img"
        aria-label="Gráfico de consultas e vendas dos últimos 14 dias"
      >
        {dados.map((d, i) => {
          const x = i * 48 + 8;
          const hConsultas = (d.consultas / max) * 100;
          const hVendas = (d.vendas / max) * 100;
          return (
            <g key={d.data.toISOString()}>
              <rect
                x={x}
                y={120 - hConsultas}
                width={14}
                height={hConsultas}
                rx={3}
                className="fill-rp-primary-500"
              />
              <rect
                x={x + 18}
                y={120 - hVendas}
                width={14}
                height={hVendas}
                rx={3}
                className="fill-rp-success"
              />
              <text
                x={x + 16}
                y={140}
                textAnchor="middle"
                className="fill-rp-slate-400 text-[8px]"
              >
                {labelDia(d.data)}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="mt-2 flex gap-4 text-xs text-rp-slate-600">
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-sm bg-rp-primary-500" />
          Consultas
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-sm bg-rp-success" />
          Vendas
        </span>
      </div>
    </div>
  );
}
