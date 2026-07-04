import { ExemploBanner, ExemploCta, RelatorioView } from "@/components/relatorio";
import { getSeoMetadata } from "@/lib/seo";
import { PLACA_EXEMPLO, relatorioExemploNormalizado } from "@/lib/relatorio/exemplo";
import { formatarPlaca } from "@/lib/placa";

export const metadata = getSeoMetadata({
  title: "Exemplo de relatório veicular completo | RevelaPlaca",
  description:
    "Veja como é o relatório completo RevelaPlaca: leilão, sinistro, roubo, gravame, restrições e débitos — com dados fictícios ilustrativos.",
  path: "/exemplo",
  keywords: ["relatório veicular", "exemplo", "leilão", "histórico veicular"],
});

export default function ExemploPage() {
  const resumo = relatorioExemploNormalizado();

  return (
    <div className="px-4 pb-20 pt-28">
      <div className="mx-auto max-w-3xl">
        <p className="rp-section-eyebrow">Exemplo</p>
        <h1 className="rp-section-heading mt-2">
          Relatório completo — {formatarPlaca(PLACA_EXEMPLO)}
        </h1>
        <p className="rp-body mt-4">
          Fiat Argo 2021 (dados fictícios). Uma seção com apontamento de leilão e
          as demais verificações sem registro.
        </p>

        <div className="mt-10">
          <RelatorioView
            resumo={resumo}
            banner={<ExemploBanner />}
            rodape={<div className="mt-8"><ExemploCta /></div>}
          />
        </div>
      </div>
    </div>
  );
}
