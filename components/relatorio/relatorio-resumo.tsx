import { cn } from "@/lib/utils";
import type { RelatorioNormalizado } from "@/lib/relatorio/types";

type Props = {
  resumo: RelatorioNormalizado;
};

export function RelatorioResumo({ resumo }: Props) {
  const { totalVerificacoes, totalApontamentos } = resumo;
  const limpo = totalApontamentos === 0;

  return (
    <div
      className={cn(
        "rounded-2xl border px-4 py-3 text-sm font-semibold",
        limpo
          ? "border-rp-success/30 bg-rp-success/10 text-rp-success"
          : totalApontamentos >= 2
            ? "border-rp-danger/30 bg-rp-danger/10 text-rp-danger"
            : "border-rp-warning/30 bg-rp-warning/10 text-rp-warning",
      )}
    >
      {totalVerificacoes} verificações realizadas · {totalApontamentos} apontamento
      {totalApontamentos === 1 ? "" : "s"}
    </div>
  );
}
