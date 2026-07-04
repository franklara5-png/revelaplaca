import { CheckCircle2, XCircle } from "lucide-react";
import { Card } from "@/components/ui";
import { formatarPlaca } from "@/lib/placa";
import type { RelatorioNormalizado } from "@/lib/relatorio/types";
import { RelatorioResumo } from "./relatorio-resumo";
import { SecaoRelatorioCard } from "./secao-relatorio";

type Props = {
  resumo: RelatorioNormalizado;
  banner?: React.ReactNode;
  rodape?: React.ReactNode;
};

export function RelatorioView({ resumo, banner, rodape }: Props) {
  const placaFmt = formatarPlaca(resumo.placa);
  const algumProblema = resumo.totalApontamentos > 0;

  return (
    <div className="space-y-6">
      {banner}

      <Card className="bg-rp-primary-900 text-white">
        <p className="text-sm text-rp-primary-100">Raio-X RevelaPlaca</p>
        <h1 className="mt-1 text-2xl font-bold">Placa {placaFmt}</h1>
        <p className="mt-3 text-sm text-rp-primary-100">
          {algumProblema
            ? "Foram encontrados registros que merecem atenção. Analise cada seção abaixo."
            : "Nenhum registro crítico encontrado nas verificações realizadas."}
        </p>
        <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs">
          {algumProblema ? (
            <>
              <XCircle className="h-3.5 w-3.5 text-rp-amber-500" />
              Revise antes de comprar ou vender
            </>
          ) : (
            <>
              <CheckCircle2 className="h-3.5 w-3.5 text-rp-emerald-500" />
              Sem alertas nas bases consultadas
            </>
          )}
        </div>
      </Card>

      <RelatorioResumo resumo={resumo} />

      {resumo.secoes.map((secao) => (
        <SecaoRelatorioCard key={secao.chave} secao={secao} />
      ))}

      <p className="text-center text-xs text-rp-slate-400">
        Dados obtidos de fontes públicas e parceiros autorizados. Uso informativo —
        não substitui vistoria presencial ou consulta oficial.
      </p>

      {rodape}
    </div>
  );
}
