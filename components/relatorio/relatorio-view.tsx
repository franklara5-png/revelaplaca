import { CheckCircle2, XCircle } from "lucide-react";
import { Card } from "@/components/ui";
import { formatarPlaca } from "@/lib/placa";
import { Placa3D } from "@/components/brand";
import type { RelatorioNormalizado } from "@/lib/relatorio/types";
import { RelatorioResumo } from "./relatorio-resumo";
import { SecaoRelatorioCard } from "./secao-relatorio";

type Props = {
  resumo: RelatorioNormalizado;
  banner?: React.ReactNode;
  rodape?: React.ReactNode;
  /**
   * 1 quando esta view e o assunto principal da pagina (/relatorio/[token]).
   * 2 quando a pagina ja tem o proprio h1 — caso de /exemplo, que antes
   * ficava com dois h1 na mesma pagina.
   */
  nivelTitulo?: 1 | 2;
};

export function RelatorioView({
  resumo,
  banner,
  rodape,
  nivelTitulo = 1,
}: Props) {
  const placaFmt = formatarPlaca(resumo.placa);
  const algumProblema = resumo.totalApontamentos > 0;
  const Titulo = nivelTitulo === 1 ? "h1" : "h2";

  return (
    <div className="space-y-6">
      {banner}

      <Card className="bg-rp-primary-900 text-white">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-rp-primary-100">Raio-X RevelaPlaca</p>
          <div aria-hidden>
            {/* Sem sombra: o card e escuro e a sombra viraria uma mancha. */}
            <Placa3D placa={resumo.placa} size="sm" sombra={false} />
          </div>
        </div>
        <Titulo className="mt-3 text-2xl font-bold">Placa {placaFmt}</Titulo>
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
