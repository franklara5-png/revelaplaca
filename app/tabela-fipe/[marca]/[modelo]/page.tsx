import { notFound } from "next/navigation";
import { FipeBreadcrumb, FipeConsultaCta } from "@/components/fipe";
import { Card } from "@/components/ui";
import { getSeoMetadata } from "@/lib/seo";
import {
  buscarModelo,
  formatarValorFipe,
  listarPrecosModelo,
  textoVariado,
} from "@/lib/fipe";
import { SITE_NAME } from "@/lib/site-url";

export const revalidate = 86_400;

type Props = {
  params: Promise<{ marca: string; modelo: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { marca: slugMarca, modelo: slugModelo } = await params;
  const info = await buscarModelo(slugMarca, slugModelo);

  if (!info) {
    return getSeoMetadata({
      title: "Modelo não encontrado",
      description: "Modelo FIPE não encontrado.",
      path: `/tabela-fipe/${slugMarca}/${slugModelo}`,
      noindex: true,
    });
  }

  const precos = await listarPrecosModelo(slugMarca, slugModelo);
  const anoRecente = precos[0]?.ano;
  const valorRecente = precos[0]?.valor
    ? formatarValorFipe(Number(precos[0].valor))
    : null;

  const descricao = valorRecente && anoRecente
    ? `Preços FIPE do ${info.marca} ${info.modelo}. Referência ${anoRecente}: ${valorRecente}. Consulte todas as versões em ${SITE_NAME}.`
    : `Preços FIPE do ${info.marca} ${info.modelo} por ano e combustível. Consulte em ${SITE_NAME}.`;

  return getSeoMetadata({
    title: `${info.marca} ${info.modelo} — Preço FIPE`,
    description: descricao,
    path: `/tabela-fipe/${slugMarca}/${slugModelo}`,
    keywords: [
      `fipe ${info.modelo}`,
      `preço ${info.modelo}`,
      `${info.marca} ${info.modelo} fipe`,
    ],
  });
}

export default async function TabelaFipeModeloPage({ params }: Props) {
  const { marca: slugMarca, modelo: slugModelo } = await params;
  const info = await buscarModelo(slugMarca, slugModelo);

  if (!info) notFound();

  const precos = await listarPrecosModelo(slugMarca, slugModelo);

  const intro = textoVariado(
    `${slugMarca}-${slugModelo}`,
    [
      "Veja abaixo os valores FIPE do {marca} {modelo} por ano e combustível. Use como referência na hora de negociar.",
      "A tabela reúne preços médios de mercado do {modelo} ({marca}), atualizados conforme referência FIPE.",
      "Compare anos do {marca} {modelo} e identifique a faixa de preço antes de consultar uma placa específica.",
    ],
    { marca: info.marca, modelo: info.modelo },
  );

  const referencia = precos.find((p) => p.referencia)?.referencia;

  return (
    <div className="px-4 pb-20 pt-28">
      <div className="mx-auto max-w-5xl">
        <FipeBreadcrumb
          items={[
            { label: "Tabela FIPE", href: "/tabela-fipe" },
            { label: info.marca, href: `/tabela-fipe/${slugMarca}` },
            { label: info.modelo },
          ]}
        />

        <h1 className="rp-section-heading">
          {info.marca} {info.modelo}
        </h1>
        <p className="rp-body mt-4 max-w-2xl">{intro}</p>
        {referencia && (
          <p className="mt-2 text-sm text-rp-slate-500">
            Referência FIPE: {referencia}
          </p>
        )}

        <Card className="mt-10 overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead>
                <tr className="border-b border-rp-slate-100 bg-rp-slate-50">
                  <th className="px-6 py-4 font-semibold text-rp-slate-900">Ano</th>
                  <th className="px-4 py-4 font-semibold text-rp-slate-900">
                    Combustível
                  </th>
                  <th className="px-4 py-4 font-semibold text-rp-slate-900">
                    Valor FIPE
                  </th>
                  <th className="px-4 py-4 font-semibold text-rp-slate-900">
                    Código
                  </th>
                </tr>
              </thead>
              <tbody>
                {precos.map((row) => (
                  <tr
                    key={row.codigo}
                    className="border-b border-rp-slate-100 last:border-0"
                  >
                    <td className="px-6 py-4 font-medium text-rp-slate-900">
                      {row.ano}
                    </td>
                    <td className="px-4 py-4 text-rp-slate-600">
                      {row.combustivel ?? "—"}
                    </td>
                    <td className="px-4 py-4 font-semibold text-rp-primary-900">
                      {formatarValorFipe(
                        row.valor ? Number(row.valor) : null,
                      )}
                    </td>
                    <td className="px-4 py-4 font-mono text-xs text-rp-slate-500">
                      {row.codigo}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="mt-10">
          <FipeConsultaCta marca={info.marca} modelo={info.modelo} />
        </div>
      </div>
    </div>
  );
}
