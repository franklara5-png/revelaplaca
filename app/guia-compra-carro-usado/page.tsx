import Link from "next/link";
import {
  Search,
  Shield,
  ClipboardCheck,
  Car,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  FileText,
  DollarSign,
  Gauge,
  Camera,
  Settings,
} from "lucide-react";
import { Card, Section } from "@/components/ui";
import { getSeoMetadata } from "@/lib/seo";
import { SITE_NAME } from "@/lib/site-url";

export const metadata = getSeoMetadata({
  title: "Guia de Compra de Carro Usado | Checklist e Dicas 2026",
  description:
    "Guia completo para comprar carro usado em 2026: checklist de verificação, consulta de placa, como evitar golpes, o que olhar na vistoria e dicas para negociar o melhor preço.",
  path: "/guia-compra-carro-usado",
  keywords: [
    "guia compra carro usado",
    "checklist carro usado",
    "como comprar carro usado",
    "dicas compra carro",
    "consulta veicular",
    "RevelaPlaca",
  ],
});

const ETAPAS = [
  {
    icon: Search,
    title: "1. Consulte a placa antes de tudo",
    items: [
      "Faça a consulta gratuita no RevelaPlaca para ver marca, modelo, ano, cor e FIPE",
      "Invista no relatório completo (R$ 24,90) para verificar leilão, sinistro, roubo e gravame",
      "Compare os dados da consulta com o anúncio — divergências são sinal de alerta",
      "Nunca vá ver um carro sem antes consultar a placa",
    ],
  },
  {
    icon: DollarSign,
    title: "2. Analise o preço",
    items: [
      "Compare o preço pedido com a Tabela FIPE (consulte no RevelaPlaca ou no site da FIPE)",
      "Desconfie de preços mais de 15% abaixo da FIPE sem justificativa documentada",
      "Pesquise o mesmo modelo em outras plataformas para entender a faixa de preço real",
      "Considere custos extras: transferência (~R$ 500), IPVA, seguro e manutenção inicial",
    ],
  },
  {
    icon: ClipboardCheck,
    title: "3. Vistoria e inspeção presencial",
    items: [
      "Leve um mecânico de confiança ou contrate vistoria cautelar especializada",
      "Confira chassis, motor e vidros — numeração deve coincidir com o CRV",
      "Verifique desgaste de volante, pedais e bancos (revela o uso real, além da km)",
      "Teste todos os equipamentos: ar-condicionado, vidros elétricos, travas, som, luzes",
      "Faça test-drive em diferentes condições (rua, avenida, subida) e preste atenção em ruídos",
    ],
  },
  {
    icon: FileText,
    title: "4. Confira a documentação",
    items: [
      "CRV (DUT) original, sem rasuras, com firma reconhecida do vendedor",
      "CRLV vigente — veículo não licenciado não pode circular nem ser transferido",
      "Certidão negativa de débitos (IPVA, multas, licenciamento)",
      "Carta de quitação de gravame se o veículo foi financiado",
      "Nome do vendedor no anúncio deve coincidir com o nome no CRV",
    ],
  },
  {
    icon: Shield,
    title: "5. Formalize a compra e transfira",
    items: [
      "Use um contrato de compra e venda com cláusulas de responsabilidade",
      "Pague somente após assinar o contrato e conferir toda a documentação",
      "Prefira Pix ou TED — confirme o crédito na conta antes de liberar o veículo",
      "Vá ao cartório reconhecer firma do vendedor no CRV",
      "Protocole a transferência no Detran em até 30 dias corridos da compra",
    ],
  },
];

const CHECKLIST_RAPIDO = [
  {
    icon: Search,
    text: "Consulta de placa feita?",
    detail: "Verifique dados básicos e histórico completo no RevelaPlaca",
  },
  {
    icon: DollarSign,
    text: "Preço compatível com a FIPE?",
    detail: "Variação acima de 15% precisa de justificativa documentada",
  },
  {
    icon: AlertTriangle,
    text: "Sem pendências ocultas?",
    detail: "Leilão, sinistro, roubo, gravame e restrições verificados",
  },
  {
    icon: Camera,
    text: "Fotos do anúncio são reais?",
    detail: "Pesquise as imagens no Google para ver se são de outros anúncios",
  },
  {
    icon: Settings,
    text: "Mecânico aprovou?",
    detail: "Vistoria presencial feita por profissional de confiança",
  },
  {
    icon: Gauge,
    text: "Quilometragem coerente?",
    detail: "Compare km com ano e desgaste interno do veículo",
  },
  {
    icon: FileText,
    text: "Documentação em ordem?",
    detail: "CRV original, CRLV vigente, sem débitos, sem gravame",
  },
  {
    icon: ClipboardCheck,
    text: "Contrato assinado?",
    detail: "Formalize a compra com contrato antes de pagar",
  },
];

const FAQ_ITEMS = [
  {
    q: "Qual o primeiro passo para comprar um carro usado?",
    a: "O primeiro passo é consultar a placa no RevelaPlaca. A consulta gratuita já mostra dados básicos como marca, modelo, ano e valor FIPE. Com essas informações, você já sabe se o anúncio é coerente antes mesmo de sair de casa. Se os dados baterem, invista no relatório completo para verificar histórico de leilão, sinistro e gravame.",
  },
  {
    q: "Como saber se o preço do carro está justo?",
    a: "Compare o preço pedido com a Tabela FIPE para aquele modelo-ano específico. O valor FIPE aparece na consulta gratuita do RevelaPlaca. Variações de 5% a 10% são normais. Preços muito abaixo da FIPE (mais de 15%) exigem investigação — podem indicar leilão, sinistro, problemas mecânicos ou golpe.",
  },
  {
    q: "Preciso pagar algum sinal antes de ver o carro?",
    a: "Não. Nunca pague sinal, depósito ou qualquer valor antes de ver o carro pessoalmente, conferir a documentação original, fazer a consulta completa da placa e aprovar a vistoria mecânica. O golpe do sinal é um dos mais comuns no mercado de usados.",
  },
  {
    q: "O que olhar durante o test-drive?",
    a: "Durante o test-drive, preste atenção em: ruídos no motor (batidas, cliques), câmbio (trancos ou demora para engatar), freios (ruídos ou trepidação), suspensão (barulhos em buracos), direção (puxando para um lado), e fumaça no escape (azul = óleo, branca = água, preta = combustível). Teste também ar-condicionado, vidros elétricos e todos os equipamentos.",
  },
  {
    q: "Vale a pena contratar vistoria cautelar?",
    a: "Sim, especialmente para veículos acima de R$ 40 mil ou quando você não tem um mecânico de confiança. A vistoria cautelar verifica adulteração de chassi e motor, repintura, pontos de solda (indicando acidente grave), e emite um laudo técnico. O custo (R$ 300 a R$ 800) é um seguro contra prejuízos muito maiores.",
  },
];

export default function GuiaCompraCarroUsadoPage() {
  return (
    <div className="px-4 pb-20 pt-28">
      {/* Hero */}
      <Section variant="white">
        <div className="mx-auto max-w-3xl text-center">
          <p className="rp-section-eyebrow">Guia de Compra</p>
          <h1 className="rp-section-heading mt-2">
            Guia de Compra de Carro Usado — Checklist e Dicas 2026
          </h1>
          <p className="rp-body mt-4 mx-auto max-w-2xl">
            Tudo o que você precisa saber antes de comprar um carro usado: da
            consulta de placa à transferência no Detran. Use nosso checklist e
            evite golpes, prejuízos e dores de cabeça.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/consulta"
              className="inline-flex items-center gap-2 rounded-[var(--rp-radius)] bg-rp-primary-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-rp-primary-700"
            >
              <Search className="size-4" />
              Consultar placa agora
              <ChevronRight className="size-4" />
            </Link>
            <Link
              href="#checklist"
              className="inline-flex items-center gap-2 rounded-[var(--rp-radius)] border border-rp-slate-200 px-6 py-3 text-sm font-semibold text-rp-slate-700 transition-colors hover:bg-rp-slate-50"
            >
              <ClipboardCheck className="size-4" />
              Ver checklist rápido
            </Link>
          </div>
        </div>
      </Section>

      {/* Checklist rápido */}
      <Section id="checklist" variant="light">
        <div className="mx-auto max-w-3xl">
          <p className="rp-section-eyebrow text-center">Checklist</p>
          <h2 className="rp-section-heading mt-2 text-center">
            Antes de fechar negócio: checklist de 8 itens
          </h2>
          <p className="rp-body mt-4 text-center">
            Passe por cada item antes de pagar. Se algo não conferir, investigue
            mais a fundo ou desista do negócio.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {CHECKLIST_RAPIDO.map((item) => (
              <Card key={item.text} className="flex gap-3">
                <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-700">
                  <item.icon className="size-4" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-rp-slate-900">
                    {item.text}
                  </p>
                  <p className="mt-0.5 text-xs text-rp-slate-500">
                    {item.detail}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </Section>

      {/* Etapas detalhadas */}
      <Section variant="white">
        <div className="mx-auto max-w-4xl">
          <p className="rp-section-eyebrow text-center">Passo a passo</p>
          <h2 className="rp-section-heading mt-2 text-center">
            As 5 etapas da compra segura
          </h2>
          <div className="mt-10 space-y-12">
            {ETAPAS.map((etapa) => (
              <div key={etapa.title}>
                <div className="flex items-center gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-rp-primary-100 text-rp-primary-700">
                    <etapa.icon className="size-5" />
                  </div>
                  <h3 className="text-lg font-bold text-rp-slate-900">
                    {etapa.title}
                  </h3>
                </div>
                <ul className="mt-4 ml-13 space-y-2">
                  {etapa.items.map((item, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 text-sm text-rp-slate-600"
                    >
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-rp-primary-600" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Sinais de alerta */}
      <Section variant="light">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center gap-3">
            <AlertTriangle className="size-6 text-amber-600" />
            <h2 className="text-xl font-bold text-rp-slate-900">
              Sinais de alerta — quando desistir do negócio
            </h2>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Card className="border-l-4 border-l-red-400">
              <h3 className="font-semibold text-rp-slate-900">
                🚩 Preço muito abaixo da FIPE
              </h3>
              <p className="mt-1 text-sm text-rp-slate-600">
                Mais de 15% abaixo do valor de referência sem justificativa
                documentada. Pode indicar leilão, sinistro ou golpe.
              </p>
            </Card>
            <Card className="border-l-4 border-l-red-400">
              <h3 className="font-semibold text-rp-slate-900">
                🚩 Vendedor recusa consulta independente
              </h3>
              <p className="mt-1 text-sm text-rp-slate-600">
                Se o vendedor não deixa você consultar a placa ou levar um
                mecânico, tem algo errado.
              </p>
            </Card>
            <Card className="border-l-4 border-l-red-400">
              <h3 className="font-semibold text-rp-slate-900">
                🚩 Urgência excessiva
              </h3>
              <p className="mt-1 text-sm text-rp-slate-600">
                "Tem outro comprador vindo amanhã", "preciso vender hoje".
                Pressa é a principal arma do golpista.
              </p>
            </Card>
            <Card className="border-l-4 border-l-red-400">
              <h3 className="font-semibold text-rp-slate-900">
                🚩 Pedido de sinal antes da visita
              </h3>
              <p className="mt-1 text-sm text-rp-slate-600">
                Nunca deposite valor algum sem ver o carro pessoalmente e
                conferir toda a documentação.
              </p>
            </Card>
            <Card className="border-l-4 border-l-red-400">
              <h3 className="font-semibold text-rp-slate-900">
                🚩 CRV com rasuras ou em nome de terceiro
              </h3>
              <p className="mt-1 text-sm text-rp-slate-600">
                Documento adulterado é crime. O vendedor precisa ser o
                proprietário registrado no CRV.
              </p>
            </Card>
            <Card className="border-l-4 border-l-red-400">
              <h3 className="font-semibold text-rp-slate-900">
                🚩 Quilometragem incompatível
              </h3>
              <p className="mt-1 text-sm text-rp-slate-600">
                Carro de 8 anos com 30 mil km e volante gasto — a conta não
                fecha. Hodômetro adulterado é crime.
              </p>
            </Card>
          </div>
        </div>
      </Section>

      {/* Custo total da compra */}
      <Section variant="white">
        <div className="mx-auto max-w-3xl">
          <p className="rp-section-eyebrow text-center">Custos</p>
          <h2 className="rp-section-heading mt-2 text-center">
            Além do preço do carro: os custos da compra
          </h2>
          <p className="rp-body mt-4 text-center">
            Não se esqueça de reservar um valor extra para estes custos. Eles
            podem representar de 5% a 15% do valor do veículo.
          </p>
          <div className="mt-8 overflow-hidden rounded-[var(--rp-radius)] border border-rp-slate-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-rp-slate-50">
                  <th className="px-4 py-3 text-left font-semibold text-rp-slate-900">
                    Item
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-rp-slate-900">
                    Custo estimado
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rp-slate-100">
                <tr>
                  <td className="px-4 py-3 text-rp-slate-700">
                    Taxa de transferência (Detran)
                  </td>
                  <td className="px-4 py-3 text-rp-slate-600">
                    R$ 150 a R$ 400
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-rp-slate-700">
                    Vistoria veicular
                  </td>
                  <td className="px-4 py-3 text-rp-slate-600">
                    R$ 100 a R$ 250
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-rp-slate-700">
                    Vistoria cautelar (opcional)
                  </td>
                  <td className="px-4 py-3 text-rp-slate-600">
                    R$ 300 a R$ 800
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-rp-slate-700">
                    Relatório completo RevelaPlaca
                  </td>
                  <td className="px-4 py-3 text-rp-slate-600">R$ 24,90</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-rp-slate-700">
                    Reconhecimento de firmas
                  </td>
                  <td className="px-4 py-3 text-rp-slate-600">R$ 20 a R$ 50</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-rp-slate-700">
                    IPVA proporcional (se devido)
                  </td>
                  <td className="px-4 py-3 text-rp-slate-600">
                    1% a 4% do valor venal
                  </td>
                </tr>
                <tr className="bg-rp-slate-50">
                  <td className="px-4 py-3 font-semibold text-rp-slate-900">
                    Total estimado
                  </td>
                  <td className="px-4 py-3 font-semibold text-rp-slate-900">
                    R$ 600 a R$ 1.500+
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </Section>

      {/* FAQ */}
      <Section variant="light">
        <div className="mx-auto max-w-3xl">
          <p className="rp-section-eyebrow text-center">Dúvidas frequentes</p>
          <h2 className="rp-section-heading mt-2 text-center">
            Perguntas sobre compra de carro usado
          </h2>
          <dl className="mt-10 space-y-6">
            {FAQ_ITEMS.map((item) => (
              <div
                key={item.q}
                className="rounded-[var(--rp-radius)] border border-rp-slate-200 bg-white p-6"
              >
                <dt className="font-semibold text-rp-slate-900">{item.q}</dt>
                <dd className="mt-2 text-sm leading-relaxed text-rp-slate-600">
                  {item.a}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </Section>

      {/* CTA */}
      <Section variant="primary" className="text-center">
        <div className="mx-auto max-w-2xl">
          <Car className="mx-auto size-10 text-rp-primary-200" />
          <h2 className="mt-4 text-2xl font-bold md:text-3xl">
            Comece pela consulta de placa
          </h2>
          <p className="mt-3 text-rp-primary-100">
            Antes de marcar visita ou pagar sinal, consulte a placa no{" "}
            {SITE_NAME}. A consulta grátis já revela dados essenciais do
            veículo. O relatório completo mostra o histórico que o vendedor pode
            não contar.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/consulta"
              className="inline-flex items-center gap-2 rounded-[var(--rp-radius)] bg-white px-8 py-4 text-base font-semibold text-rp-primary-700 transition-colors hover:bg-rp-primary-50"
            >
              <Search className="size-5" />
              Consultar placa agora
              <ChevronRight className="size-5" />
            </Link>
            <Link
              href="/contrato-compra-venda-veiculo"
              className="inline-flex items-center gap-2 rounded-[var(--rp-radius)] border border-white/20 px-8 py-4 text-base font-semibold text-white transition-colors hover:bg-white/10"
            >
              <FileText className="size-5" />
              Gerar contrato de compra e venda
            </Link>
          </div>
          <p className="mt-4 text-sm text-rp-primary-200">
            Consulta grátis — sem cadastro. Relatório completo opcional por R$
            24,90.
          </p>
        </div>
      </Section>

      {/* Schema JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: FAQ_ITEMS.map((item) => ({
              "@type": "Question",
              name: item.q,
              acceptedAnswer: {
                "@type": "Answer",
                text: item.a,
              },
            })),
            publisher: {
              "@type": "Organization",
              name: SITE_NAME,
              url: "https://revelaplaca.com.br",
            },
          }),
        }}
      />
    </div>
  );
}
