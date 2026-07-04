import Link from "next/link";
import { Card, Section } from "@/components/ui";
import { getSeoMetadata } from "@/lib/seo";
import { SITE_NAME } from "@/lib/site-url";

export const metadata = getSeoMetadata({
  title: "Fontes de dados veiculares | RevelaPlaca",
  description:
    "Transparência sobre as fontes usadas no RevelaPlaca: bases públicas, Tabela FIPE e parceiros autorizados. Sem dados pessoais do proprietário.",
  path: "/fontes",
  keywords: [
    "fontes consulta placa",
    "dados veiculares",
    "LGPD",
    "tabela FIPE",
    "histórico veicular",
  ],
});

const FONTES = [
  {
    titulo: "Bases públicas e oficiais",
    texto:
      "Cruzamos registros disponíveis em bases públicas e cadastros oficiais de veículos, sempre dentro do que a legislação permite divulgar sem identificar o proprietário.",
  },
  {
    titulo: "Tabela FIPE",
    texto:
      "Valores de referência de mercado são obtidos da Tabela FIPE (Fundação Instituto de Pesquisas Econômicas), atualizada periodicamente conforme a referência exibida na consulta.",
  },
  {
    titulo: "Parceiros veiculares autorizados",
    texto:
      "O relatório completo consulta bases premium de parceiros homologados para leilão, sinistro, roubo/furto, gravame, restrições e débitos. A disponibilidade pode variar por veículo e data.",
  },
];

export default function FontesPage() {
  return (
    <div className="px-4 pb-20 pt-28">
      <Section variant="white">
        <div className="mx-auto max-w-3xl">
          <p className="rp-section-eyebrow">Transparência</p>
          <h1 className="rp-section-heading mt-2">De onde vêm os dados</h1>
          <p className="rp-body mt-4">
            O {SITE_NAME} combina fontes públicas, FIPE e parceiros autorizados para
            revelar o histórico do <strong>veículo</strong> — nunca dados pessoais do
            proprietário, em conformidade com a LGPD.
          </p>

          <div className="mt-10 space-y-6">
            {FONTES.map((fonte) => (
              <Card key={fonte.titulo}>
                <h2 className="text-lg font-bold text-rp-slate-900">{fonte.titulo}</h2>
                <p className="mt-2 text-sm leading-relaxed text-rp-slate-600">
                  {fonte.texto}
                </p>
              </Card>
            ))}
          </div>

          <Card className="mt-8 border-rp-primary-100 bg-rp-primary-50">
            <h2 className="text-lg font-bold text-rp-primary-900">Limitações</h2>
            <ul className="mt-3 list-inside list-disc space-y-2 text-sm text-rp-slate-700">
              <li>
                A consulta online não substitui vistoria presencial nem perícia
                mecânica.
              </li>
              <li>
                Algumas bases podem estar temporariamente indisponíveis; nesse caso,
                o relatório indica quais verificações não puderam ser concluídas.
              </li>
              <li>
                Dados exibidos refletem o momento da consulta e podem mudar após
                transferências, quitações ou atualizações cadastrais.
              </li>
            </ul>
          </Card>

          <p className="mt-8 text-sm text-rp-slate-600">
            Para orientação sobre golpes em negócios de veículos, veja também o{" "}
            <a
              href="https://desconfiei.com.br"
              className="font-semibold text-rp-primary-700 hover:underline"
            >
              Desconfiei
            </a>
            .
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/"
              className="text-sm font-semibold text-rp-primary-700 hover:underline"
            >
              Consultar placa grátis →
            </Link>
            <Link
              href="/contrato-compra-venda-veiculo"
              className="text-sm font-semibold text-rp-primary-700 hover:underline"
            >
              Gerar contrato de compra e venda →
            </Link>
          </div>
        </div>
      </Section>
    </div>
  );
}
