import { RelatorioView } from "./relatorio-view";
import { normalizarRelatorio } from "@/lib/relatorio/normalizar";

type Props = {
  placa: string;
  dados: Record<string, unknown>;
  rodape?: React.ReactNode;
};

export function RelatorioCompleto({ placa, dados, rodape }: Props) {
  const resumo = normalizarRelatorio(placa, dados);
  return <RelatorioView resumo={resumo} rodape={rodape} />;
}
