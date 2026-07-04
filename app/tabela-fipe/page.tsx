import Link from "next/link";
import { notFound } from "next/navigation";
import { FipeBreadcrumb } from "@/components/fipe";
import { Card } from "@/components/ui";
import { getSeoMetadata } from "@/lib/seo";
import { listarMarcas } from "@/lib/fipe";
import { SITE_NAME } from "@/lib/site-url";

export const revalidate = 86_400;

export async function generateMetadata() {
  return getSeoMetadata({
    title: "Tabela FIPE — preços de carros por marca",
    description: `Consulte preços FIPE atualizados por marca e modelo. Compare anos e combustíveis em ${SITE_NAME}.`,
    path: "/tabela-fipe",
    keywords: ["tabela fipe", "preço fipe", "valor fipe", "fipe carros"],
  });
}

export default async function TabelaFipeIndexPage() {
  const marcas = await listarMarcas();

  return (
    <div className="px-4 pb-20 pt-28">
      <div className="mx-auto max-w-5xl">
        <FipeBreadcrumb items={[{ label: "Tabela FIPE" }]} />

        <h1 className="rp-section-heading">Tabela FIPE</h1>
        <p className="rp-body mt-4 max-w-2xl">
          Preços de referência da Tabela FIPE organizados por marca e modelo.
          Escolha uma marca para ver modelos, anos e valores atualizados.
        </p>

        {marcas.length === 0 ? (
          <Card className="mt-10 text-center">
            <p className="text-sm text-rp-slate-600">
              A base FIPE ainda não foi importada. Execute{" "}
              <code className="rounded bg-rp-slate-100 px-1.5 py-0.5 text-xs">
                npm run import:fipe
              </code>{" "}
              para popular o banco.
            </p>
          </Card>
        ) : (
          <>
            <p className="mt-4 text-sm text-rp-slate-500">
              {marcas.length} marcas · milhares de páginas de modelos
            </p>
            <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {marcas.map((marca) => (
                <li key={marca.slugMarca}>
                  <Link
                    href={`/tabela-fipe/${marca.slugMarca}`}
                    className="rp-card block p-4 transition-shadow hover:shadow-[var(--rp-shadow-card-hover)]"
                  >
                    <span className="font-semibold text-rp-slate-900">
                      {marca.marca}
                    </span>
                    <span className="mt-1 block text-sm text-rp-slate-500">
                      {marca.totalModelos} modelos
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
