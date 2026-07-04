import Link from "next/link";
import { notFound } from "next/navigation";
import { FipeBreadcrumb } from "@/components/fipe";
import { getSeoMetadata } from "@/lib/seo";
import { buscarMarca, listarModelosPorMarca, textoVariado } from "@/lib/fipe";
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

  return getSeoMetadata({
    title: `${marca.marca} — Tabela FIPE`,
    description: `Preços FIPE de todos os modelos ${marca.marca}. Compare valores por ano e combustível em ${SITE_NAME}.`,
    path: `/tabela-fipe/${slugMarca}`,
    keywords: [`fipe ${marca.marca}`, `preço ${marca.marca}`, "tabela fipe"],
  });
}

export default async function TabelaFipeMarcaPage({ params }: Props) {
  const { marca: slugMarca } = await params;
  const marca = await buscarMarca(slugMarca);

  if (!marca) notFound();

  const modelos = await listarModelosPorMarca(slugMarca);

  const intro = textoVariado(
    slugMarca,
    [
      "Confira os preços FIPE oficiais dos modelos {marca}. Cada página traz valores por ano e tipo de combustível.",
      "A Tabela FIPE de {marca} reúne referências de mercado para compra, venda e seguro de veículos.",
      "Compare modelos {marca} lado a lado: anos, combustível e valor médio atualizado pela FIPE.",
    ],
    { marca: marca.marca },
  );

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
        <p className="rp-body mt-4 max-w-2xl">{intro}</p>
        <p className="mt-2 text-sm text-rp-slate-500">
          {modelos.length} modelos catalogados
        </p>

        <ul className="mt-10 grid gap-3 sm:grid-cols-2">
          {modelos.map((modelo) => (
            <li key={modelo.slugModelo}>
              <Link
                href={`/tabela-fipe/${slugMarca}/${modelo.slugModelo}`}
                className="rp-card flex items-center justify-between p-4 transition-shadow hover:shadow-[var(--rp-shadow-card-hover)]"
              >
                <span className="font-semibold text-rp-slate-900">
                  {modelo.modelo}
                </span>
                <span className="text-sm text-rp-slate-500">
                  {modelo.totalAnos} anos
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
