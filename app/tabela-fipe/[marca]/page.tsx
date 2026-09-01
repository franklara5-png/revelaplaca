import Link from "next/link";
import { notFound } from "next/navigation";
import { FipeBreadcrumb } from "@/components/fipe";
import { getSeoMetadata } from "@/lib/seo";
import {
  buscarMarca,
  formatarAnoFipe,
  formatarValorFipe,
  listarModelosPorMarca,
  resumirMarca,
} from "@/lib/fipe";
import { SITE_NAME } from "@/lib/site-url";

export const revalidate = 86_400;

type Props = {
  params: Promise<{ marca: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { marca: slugMarca } = await params;
  const marca = await buscarMarca(slugMarca);

  if (!marca) {
    return getSeoMetadata({
      title: "Marca não encontrada",
      description: "Marca FIPE não encontrada.",
      path: `/tabela-fipe/${slugMarca}`,
      noindex: true,
    });
  }

  const resumo = await resumirMarca(slugMarca);

  // Description com os numeros da propria marca, nao um molde repetido.
  const descricao = resumo
    ? `${resumo.totalModelos} modelos ${marca.marca} na tabela FIPE, de ${formatarValorFipe(resumo.valorMin)} a ${formatarValorFipe(resumo.valorMax)}. Compare por ano e combustível em ${SITE_NAME}.`
    : `Preços FIPE de todos os modelos ${marca.marca}. Compare valores por ano e combustível em ${SITE_NAME}.`;

  return getSeoMetadata({
    title: `${marca.marca} — Tabela FIPE`,
    description: descricao,
    path: `/tabela-fipe/${slugMarca}`,
    keywords: [`fipe ${marca.marca}`, `preço ${marca.marca}`, "tabela fipe"],
  });
}

export default async function TabelaFipeMarcaPage({ params }: Props) {
  const { marca: slugMarca } = await params;
  const marca = await buscarMarca(slugMarca);

  if (!marca) notFound();

  const [modelos, resumo] = await Promise.all([
    listarModelosPorMarca(slugMarca),
    resumirMarca(slugMarca),
  ]);

  return (
    <div className="px-4 pb-20 pt-28">
      <div className="mx-auto max-w-5xl">
        <FipeBreadcrumb
          items={[
            { label: "Tabela FIPE", href: "/tabela-fipe" },
            { label: marca.marca },
          ]}
        />

        <h1 className="rp-section-heading">FIPE — {marca.marca}</h1>

        {resumo ? (
          <p className="rp-body mt-4 max-w-3xl">
            São {resumo.totalModelos}{" "}
            {resumo.totalModelos === 1 ? "modelo" : "modelos"} {marca.marca} na
            tabela FIPE, somando {resumo.totalRegistros} combinações de ano e
            combustível
            {resumo.anoMin && resumo.anoMax
              ? ` entre ${resumo.anoMin} e ${resumo.anoMax}`
              : ""}
            . Os valores vão de {formatarValorFipe(resumo.valorMin)} a{" "}
            {formatarValorFipe(resumo.valorMax)}.
          </p>
        ) : (
          <p className="rp-body mt-4 max-w-3xl">
            Preços FIPE dos modelos {marca.marca}, por ano e combustível.
          </p>
        )}

        {resumo?.referencia && (
          <p className="mt-2 text-sm text-rp-slate-500">
            Referência FIPE: {resumo.referencia}
          </p>
        )}

        {(resumo?.maisBarato || resumo?.maisCaro) && (
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {resumo.maisBarato && (
              <Link
                href={`/tabela-fipe/${slugMarca}/${resumo.maisBarato.slugModelo}`}
                className="rp-card block p-5"
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-rp-slate-400">
                  Menor valor da marca
                </p>
                <p className="mt-2 font-semibold text-rp-slate-900">
                  {resumo.maisBarato.modelo}
                </p>
                <p className="mt-1 text-2xl font-bold text-rp-primary-900">
                  {formatarValorFipe(resumo.maisBarato.valor)}
                </p>
                <p className="mt-1 text-xs text-rp-slate-500">
                  ano {formatarAnoFipe(resumo.maisBarato.ano)}
                </p>
              </Link>
            )}
            {resumo.maisCaro && (
              <Link
                href={`/tabela-fipe/${slugMarca}/${resumo.maisCaro.slugModelo}`}
                className="rp-card block p-5"
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-rp-slate-400">
                  Maior valor da marca
                </p>
                <p className="mt-2 font-semibold text-rp-slate-900">
                  {resumo.maisCaro.modelo}
                </p>
                <p className="mt-1 text-2xl font-bold text-rp-primary-900">
                  {formatarValorFipe(resumo.maisCaro.valor)}
                </p>
                <p className="mt-1 text-xs text-rp-slate-500">
                  ano {formatarAnoFipe(resumo.maisCaro.ano)}
                </p>
              </Link>
            )}
          </div>
        )}

        <h2 className="rp-section-heading mt-12 text-2xl">
          Todos os modelos {marca.marca}
        </h2>

        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {modelos.map((modelo) => (
            <li key={modelo.slugModelo}>
              <Link
                href={`/tabela-fipe/${slugMarca}/${modelo.slugModelo}`}
                className="rp-card flex items-center justify-between p-4"
              >
                <span className="font-semibold text-rp-slate-900">
                  {modelo.modelo}
                </span>
                <span className="shrink-0 pl-3 text-sm text-rp-slate-500">
                  {modelo.totalAnos} {modelo.totalAnos === 1 ? "ano" : "anos"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
