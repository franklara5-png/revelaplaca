import type { EtapaFunil } from "@/lib/admin/funil";

type Props = {
  etapas: EtapaFunil[];
};

export function FunilFunnel({ etapas }: Props) {
  const max = Math.max(1, ...etapas.map((e) => e.total));

  return (
    <div className="space-y-3">
      {etapas.map((etapa, i) => {
        const largura = Math.max(8, (etapa.total / max) * 100);
        return (
          <div key={etapa.nome}>
            <div className="flex items-baseline justify-between gap-2 text-sm">
              <span className="font-medium text-rp-ink">
                {i + 1}. {etapa.label}
              </span>
              <span className="tabular-nums text-rp-slate-600">
                {etapa.total.toLocaleString("pt-BR")}
                {etapa.taxaAnterior !== null && (
                  <span className="ml-2 text-xs text-rp-slate-400">
                    ({etapa.taxaAnterior}%)
                  </span>
                )}
              </span>
            </div>
            <div className="mt-1 h-2 overflow-hidden rounded-full bg-rp-slate-100">
              <div
                className="h-full rounded-full bg-rp-primary-600 transition-all"
                style={{ width: `${largura}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
