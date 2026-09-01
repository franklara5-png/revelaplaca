type Ponto = {
  label: string;
  receitaCentavos: number;
};

type Props = {
  dados: Ponto[];
};

export function GraficoReceitaMensal({ dados }: Props) {
  const max = Math.max(1, ...dados.map((d) => d.receitaCentavos));

  return (
    <div className="overflow-x-auto">
      <svg
        viewBox={`0 0 ${dados.length * 48} 160`}
        className="h-40 w-full min-w-[480px]"
        role="img"
        aria-label="Receita paga dos últimos 12 meses"
      >
        {dados.map((d, i) => {
          const x = i * 48 + 12;
          const altura = (d.receitaCentavos / max) * 100;
          return (
            <g key={d.label}>
              <rect
                x={x}
                y={120 - altura}
                width={24}
                height={altura}
                rx={3}
                className="fill-rp-primary-500"
              />
              <text
                x={x + 12}
                y={140}
                textAnchor="middle"
                className="fill-rp-slate-400 text-[8px]"
              >
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
