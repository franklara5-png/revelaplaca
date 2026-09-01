import Link from "next/link";
import { notFound } from "next/navigation";
import { FipeBreadcrumb, FipeConsultaCta } from "@/components/fipe";
import { Card } from "@/components/ui";
import { getSeoMetadata } from "@/lib/seo";
import {
  buscarModelo,
  calcularEstatisticasModelo,
  formatarAnoFipe,
  formatarValorFipe,
  listarModelosPorMarca,
  listarPrecosModelo,
} from "@/lib/fipe";
import { SITE_NAME } from "@/lib/site-url";

export const revalidate = 86_400;

type Props = {
  params: Promise<{ marca: string; modelo: string }>;
};

const pct = (n: number) =>
  `${Math.abs(n).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%`;

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
  const est = calcularEstatisticasModelo(precos);

  // Description com numeros reais do proprio modelo — cada pagina descreve a
  // si mesma em vez de repetir um molde.
  const descricao = est
    ? `Preços FIPE do ${info.marca} ${info.modelo} de ${est.anoAntigo} a ${est.anoNovo}: de ${formatarValorFipe(est.valorAntigo)} a ${formatarValorFipe(est.valorNovo)}. Veja a variação ano a ano em ${SITE_NAME}.`
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
  const est = calcularEstatisticasModelo(precos);
  const referencia = precos.find((p) => p.referencia)?.referencia;

  const desvalorizou = (est?.variacaoPercentual ?? 0) >= 0;
  const nome = `${info.marca} ${info.modelo}`;

  // Modelos vizinhos da mesma marca: tira a pagina do beco sem saida e dá ao
  // crawler um caminho lateral em vez de so subir no breadcrumb.
  const irmaos = (await listarModelosPorMarca(slugMarca))
    .filter((m) => m.slugModelo !== slugModelo)
    .slice(0, 8);

  const faqs = est
    ? [
        {
          q: `Qual o valor de tabela FIPE do ${nome}?`,
          a: `Na referência ${referencia ?? "mais recente"}, o ${nome} vai de ${formatarValorFipe(est.valorAntigo)} no ano ${est.anoAntigo} a ${formatarValorFipe(est.valorNovo)} no ano ${est.anoNovo}. A tabela completa, ano a ano e por combustível, está nesta página.`,
        },
        {
          q: `Quanto o ${nome} ${desvalorizou ? "desvaloriza" : "valoriza"} por ano?`,
          a: `Comparando ${est.anoAntigo} com ${est.anoNovo}, a diferença é de ${pct(est.variacaoPercentual)} em ${est.intervaloAnos} anos — cerca de ${pct(est.variacaoAnualMedia)} ao ano. É a variação entre anos-modelo na tabela atual, não a projeção de quanto um carro específico vai ${desvalorizou ? "perder" : "ganhar"} daqui para frente.`,
        },
        {
          q: `O preço da FIPE é o que vou pagar no ${info.modelo}?`,
          a: `Não. A FIPE é uma média nacional e serve de referência para negociação, seguro e financiamento. O preço real varia com região, quilometragem, estado de conservação e, principalmente, histórico do veículo — um exemplar com passagem por leilão ou sinistro vale menos que a tabela.`,
        },
      ]
    : [];

  return (
    <div className="px-4 pb-20 pt-28">
      <div className="mx-auto max-w-5xl">
        {faqs.length > 0 && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "FAQPage",
                mainEntity: faqs.map((f) => ({
                  "@type": "Question",
                  name: f.q,
                  acceptedAnswer: { "@type": "Answer", text: f.a },
                })),
              }),
            }}
          />
        )}

        <FipeBreadcrumb
          items={[
            { label: "Tabela FIPE", href: "/tabela-fipe" },
            { label: info.marca, href: `/tabela-fipe/${slugMarca}` },
            { label: info.modelo },
          ]}
        />

        <h1 className="rp-section-heading">{nome}</h1>

        {est ? (
          <p className="rp-body mt-4 max-w-3xl">
            O {nome} aparece na tabela FIPE em {est.totalAnos}{" "}
            {est.totalAnos === 1 ? "ano-modelo" : "anos-modelo"}, de{" "}
            {est.anoAntigo} a {est.anoNovo}. O mais recente está em{" "}
            {formatarValorFipe(est.valorNovo)} e o mais antigo em{" "}
            {formatarValorFipe(est.valorAntigo)} — uma{" "}
            {desvalorizou ? "queda" : "alta"} de {pct(est.variacaoPercentual)} ao
            longo de {est.intervaloAnos}{" "}
            {est.intervaloAnos === 1 ? "ano" : "anos"}, ou cerca de{" "}
            {pct(est.variacaoAnualMedia)} ao ano.
            {est.temZeroKm && " A tabela inclui também a versão 0 km."}
          </p>
        ) : (
          <p className="rp-body mt-4 max-w-3xl">
            Valores FIPE do {nome} por ano e combustível. Use como referência na
            hora de negociar.
          </p>
        )}

        {referencia && (
          <p className="mt-2 text-sm text-rp-slate-500">
            Referência FIPE: {referencia}
          </p>
        )}

        {est && (
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <Card className="p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-rp-slate-400">
                Mais recente · {formatarAnoFipe(est.anoNovo)}
              </p>
              <p className="mt-1 text-2xl font-bold text-rp-primary-900">
                {formatarValorFipe(est.valorNovo)}
              </p>
            </Card>
            <Card className="p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-rp-slate-400">
                Mais antigo · {formatarAnoFipe(est.anoAntigo)}
              </p>
              <p className="mt-1 text-2xl font-bold text-rp-slate-900">
                {formatarValorFipe(est.valorAntigo)}
              </p>
            </Card>
            <Card className="p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-rp-slate-400">
                {desvalorizou ? "Desvalorização" : "Valorização"} no período
              </p>
              <p className="mt-1 text-2xl font-bold text-rp-slate-900">
                {pct(est.variacaoPercentual)}
              </p>
              <p className="mt-1 text-xs text-rp-slate-500">
                ~{pct(est.variacaoAnualMedia)} ao ano
              </p>
            </Card>
          </div>
        )}

        <Card className="mt-8 overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] text-left text-sm">
              <caption className="sr-only">
                Preços da tabela FIPE do {nome} por ano e combustível
              </caption>
              <thead>
                <tr className="border-b border-rp-slate-100 bg-rp-slate-50">
                  <th scope="col" className="px-6 py-4 font-semibold text-rp-slate-900">
                    Ano
                  </th>
                  <th scope="col" className="px-4 py-4 font-semibold text-rp-slate-900">
                    Combustível
                  </th>
                  <th scope="col" className="px-4 py-4 font-semibold text-rp-slate-900">
                    Valor FIPE
                  </th>
                  <th scope="col" className="px-4 py-4 font-semibold text-rp-slate-900">
                    Código
                  </th>
                </tr>
              </thead>
              <tbody>
                {precos.map((row) => (
                  <tr
                    // `codigo` sozinho repete entre anos/combustiveis do mesmo
                    // modelo — a chave precisa ser a PK composta inteira.
                    key={`${row.codigo}-${row.ano}-${row.combustivel}`}
                    className="border-b border-rp-slate-100 last:border-0"
                  >
                    <td className="px-6 py-4 font-medium text-rp-slate-900">
                      {formatarAnoFipe(row.ano)}
                    </td>
                    <td className="px-4 py-4 text-rp-slate-600">
                      {row.combustivel || "—"}
                    </td>
                    <td className="px-4 py-4 font-semibold text-rp-primary-900">
                      {formatarValorFipe(row.valor ? Number(row.valor) : null)}
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

        {faqs.length > 0 && (
          <section className="mt-12">
            <h2 className="rp-section-heading text-2xl">
              Dúvidas sobre o preço do {info.modelo}
            </h2>
            <div className="mt-6 space-y-4">
              {faqs.map((f) => (
                <Card key={f.q} className="p-5">
                  <h3 className="font-semibold text-rp-slate-900">{f.q}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-rp-slate-600">
                    {f.a}
                  </p>
                </Card>
              ))}
            </div>
          </section>
        )}

        {irmaos.length > 0 && (
          <section className="mt-12">
            <h2 className="rp-section-heading text-2xl">
              Outros modelos {info.marca}
            </h2>
            <ul className="mt-6 grid gap-2 sm:grid-cols-2">
              {irmaos.map((m) => (
                <li key={m.slugModelo}>
                  <Link
                    href={`/tabela-fipe/${slugMarca}/${m.slugModelo}`}
                    className="rp-card flex items-center justify-between p-4 text-sm transition-shadow"
                  >
                    <span className="font-medium text-rp-slate-900">
                      {m.modelo}
                    </span>
                    <span className="text-rp-slate-500">
                      {m.totalAnos} {m.totalAnos === 1 ? "ano" : "anos"}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="mt-12">
          <FipeConsultaCta marca={info.marca} modelo={info.modelo} />
        </div>
      </div>
    </div>
  );
}
