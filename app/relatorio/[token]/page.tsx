import { notFound } from "next/navigation";
import Link from "next/link";
import { RelatorioCompleto } from "@/components/relatorio";
import { getSeoMetadata } from "@/lib/seo";
import { formatarPlaca } from "@/lib/placa";
import { buscarRelatorioValidoPorToken } from "@/lib/relatorios";

type Props = {
  params: Promise<{ token: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { token } = await params;

  return getSeoMetadata({
    title: "Relatório veicular",
    description: "Relatório completo veicular — acesso privado.",
    path: `/relatorio/${token}`,
    noindex: true,
  });
}

export default async function RelatorioPage({ params }: Props) {
  const { token } = await params;

  const relatorio = await buscarRelatorioValidoPorToken(token).catch(() => null);

  if (!relatorio) {
    notFound();
  }

  const placaFmt = formatarPlaca(relatorio.placa);
  const dados = relatorio.dados as Record<string, unknown>;

  return (
    <div className="px-4 pb-20 pt-28">
      <div className="mx-auto max-w-3xl">
        <RelatorioCompleto placa={placaFmt} dados={dados} />
        <p className="mt-8 text-center text-sm text-rp-slate-600">
          Consulta grátis desta placa:{" "}
          <Link
            href={`/consulta/${relatorio.placa}`}
            className="font-semibold text-rp-primary-700 hover:underline"
          >
            {placaFmt}
          </Link>
        </p>
      </div>
    </div>
  );
}
