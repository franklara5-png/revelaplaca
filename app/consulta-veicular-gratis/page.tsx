import Link from "next/link";
import { Shield, Search, FileText, Car, ChevronRight, CheckCircle2, AlertTriangle, Lock } from "lucide-react";
import { Card, Section } from "@/components/ui";
import { getSeoMetadata } from "@/lib/seo";
import { SITE_NAME } from "@/lib/site-url";

export const metadata = getSeoMetadata({
  title: "Consulta Veicular Grátis | Como Puxar Dados do Veículo",
  description:
    "Faça consulta veicular grátis pela placa: descubra marca, modelo, ano, cor e valor FIPE. Relatório completo opcional com leilão, sinistro e restrições.",
  path: "/consulta-veicular-gratis",
  keywords: [
    "consulta veicular grátis",
    "consultar placa grátis",
    "puxar dados veículo",
    "consulta placa",
    "histórico veicular",
    "RevelaPlaca",
  ],
});

const BENEFICIOS = [
  {
    icon: Search,
    title: "Consulta por placa em segundos",
    text: "Digite a placa do veículo e receba instantaneamente dados como marca, modelo, ano, cor e valor FIPE. Sem cadastro, sem burocracia.",
  },
  {
    icon: Shield,
    title: "Consulta gratuita e segura",
    text: "A consulta básica é 100% gratuita. Exibimos apenas dados do veículo — nunca dados pessoais do proprietário, em conformidade com a LGPD.",
  },
  {
    icon: FileText,
    title: "Relatório completo opcional",
    text: "Para fechar negócio, invista no relatório pago (R$ 24,90) que revela leilão, sinistro, roubo, gravame, restrições e débitos. Acesso por 90 dias.",
  },
  {
    icon: AlertTriangle,
    title: "Evite golpes e surpresas",
    text: "Antes de comprar um carro usado, consulte a placa. O que o vendedor não conta, a placa revela — histórico de leilão, sinistro e pendências.",
  },
];

const PASSOS = [
  {
    step: "1",
    title: "Digite a placa",
    text: "Informe a placa do veículo (formato antigo ou Mercosul). O sistema normaliza automaticamente.",
  },
  {
    step: "2",
    title: "Confirme a verificação",
    text: "Complete a verificação de segurança (Turnstile) para provar que você não é um robô.",
  },
  {
    step: "3",
    title: "Veja o resultado",
    text: "Receba na hora: marca, modelo, ano, cor, combustível, município/UF e valor FIPE estimado.",
  },
  {
    step: "4",
    title: "Aprofunde se quiser",
    text: "Se for fechar negócio, adquira o relatório completo com histórico de leilão, sinistro e restrições.",
  },
];

const FAQ_ITEMS = [
  {
    q: "A consulta veicular grátis é realmente gratuita?",
    a: "Sim. A consulta básica no RevelaPlaca é 100% gratuita e mostra marca, modelo, ano, cor, município/UF e valor FIPE estimado. Você não paga nada para acessar esses dados.",
  },
  {
    q: "Preciso informar CPF ou dados pessoais para consultar?",
    a: "Não. Basta a placa do veículo. Não solicitamos CPF, e-mail, telefone ou qualquer dado pessoal para a consulta gratuita. Seus dados não são coletados nem armazenados.",
  },
  {
    q: "A consulta mostra dados do proprietário?",
    a: "Não. Em conformidade com a LGPD, exibimos apenas dados do veículo — nunca nome, CPF, CNPJ ou endereço do proprietário. Desconfie de sites que prometem revelar o dono pela placa.",
  },
  {
    q: "Qual a diferença entre a consulta grátis e o relatório completo?",
    a: "A consulta grátis mostra dados básicos de identificação do veículo e valor FIPE. O relatório completo (R$ 24,90) adiciona verificações detalhadas: histórico de leilão e remarketing, indícios de sinistro, roubo/furto, gravame ativo, restrições judiciais e débitos pendentes.",
  },
  {
    q: "Quanto tempo leva para o resultado aparecer?",
    a: "A consulta grátis é instantânea — você vê o resultado em segundos após completar a verificação de segurança. O relatório completo é enviado por e-mail em poucos minutos após o pagamento.",
  },
];

export default function ConsultaVeicularGratisPage() {
  return (
    <div className="px-4 pb-20 pt-28">
      {/* Hero */}
      <Section variant="white">
        <div className="mx-auto max-w-3xl text-center">
          <p className="rp-section-eyebrow">Consulta Veicular</p>
          <h1 className="rp-section-heading mt-2">
            Consulte qualquer placa grátis no {SITE_NAME}
          </h1>
          <p className="rp-body mt-4 mx-auto max-w-2xl">
            Descubra em segundos os dados de qualquer veículo pela placa: marca,
            modelo, ano, cor, valor FIPE. A consulta é <strong>gratuita</strong>,
            sem cadastro e sem expor dados do proprietário.
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
              href="/blog/como-consultar-placa-gratis"
              className="inline-flex items-center gap-2 rounded-[var(--rp-radius)] border border-rp-slate-200 px-6 py-3 text-sm font-semibold text-rp-slate-700 transition-colors hover:bg-rp-slate-50"
            >
              Como funciona →
            </Link>
          </div>
        </div>
      </Section>

      {/* Benefícios */}
      <Section variant="light">
        <div className="mx-auto max-w-5xl">
          <p className="rp-section-eyebrow text-center">Por que consultar</p>
          <h2 className="rp-section-heading mt-2 text-center">
            Vantagens da consulta veicular gratuita
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {BENEFICIOS.map((item) => (
              <Card key={item.title} className="flex gap-4">
                <div className="mt-1 flex size-10 shrink-0 items-center justify-center rounded-lg bg-rp-primary-100 text-rp-primary-700">
                  <item.icon className="size-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-rp-slate-900">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-rp-slate-600">
                    {item.text}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </Section>

      {/* Como funciona / Passos */}
      <Section variant="white">
        <div className="mx-auto max-w-3xl">
          <p className="rp-section-eyebrow text-center">Passo a passo</p>
          <h2 className="rp-section-heading mt-2 text-center">
            Como consultar uma placa
          </h2>
          <div className="mt-10 space-y-6">
            {PASSOS.map((item) => (
              <div
                key={item.step}
                className="flex gap-4 rounded-[var(--rp-radius)] border border-rp-slate-100 p-6"
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-rp-primary-600 text-sm font-bold text-white">
                  {item.step}
                </div>
                <div>
                  <h3 className="font-semibold text-rp-slate-900">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-rp-slate-600">
                    {item.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link
              href="/consulta"
              className="inline-flex items-center gap-2 rounded-[var(--rp-radius)] bg-rp-primary-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-rp-primary-700"
            >
              <Search className="size-4" />
              Fazer consulta grátis
            </Link>
          </div>
        </div>
      </Section>

      {/* O que está incluído */}
      <Section variant="light">
        <div className="mx-auto max-w-5xl">
          <p className="rp-section-eyebrow text-center">O que você recebe</p>
          <h2 className="rp-section-heading mt-2 text-center">
            Dados incluídos em cada consulta
          </h2>

          <div className="mt-10 grid gap-8 sm:grid-cols-2">
            <Card>
              <div className="mb-4 flex items-center gap-2">
                <div className="rounded-full bg-green-100 p-1 text-green-700">
                  <CheckCircle2 className="size-4" />
                </div>
                <h3 className="font-semibold text-rp-slate-900">
                  Consulta grátis
                </h3>
                <span className="ml-auto rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700">
                  GRÁTIS
                </span>
              </div>
              <ul className="space-y-2 text-sm text-rp-slate-600">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-green-600" />
                  Marca, modelo e versão
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-green-600" />
                  Ano de fabricação e ano modelo
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-green-600" />
                  Cor e tipo de combustível
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-green-600" />
                  Município e UF de emplacamento
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-green-600" />
                  Valor de referência FIPE
                </li>
              </ul>
            </Card>

            <Card>
              <div className="mb-4 flex items-center gap-2">
                <div className="rounded-full bg-rp-primary-100 p-1 text-rp-primary-700">
                  <Lock className="size-4" />
                </div>
                <h3 className="font-semibold text-rp-slate-900">
                  Relatório completo
                </h3>
                <span className="ml-auto rounded-full bg-rp-primary-100 px-2.5 py-0.5 text-xs font-semibold text-rp-primary-700">
                  R$ 24,90
                </span>
              </div>
              <ul className="space-y-2 text-sm text-rp-slate-600">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-rp-primary-600" />
                  Tudo da consulta grátis
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-rp-primary-600" />
                  Histórico de leilão e remarketing
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-rp-primary-600" />
                  Indícios de sinistro (perda total)
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-rp-primary-600" />
                  Roubo, furto e gravame ativo
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-rp-primary-600" />
                  Restrições judiciais e débitos
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </Section>

      {/* FAQ */}
      <Section variant="white">
        <div className="mx-auto max-w-3xl">
          <p className="rp-section-eyebrow text-center">Dúvidas frequentes</p>
          <h2 className="rp-section-heading mt-2 text-center">
            Perguntas sobre consulta veicular
          </h2>
          <dl className="mt-10 space-y-6">
            {FAQ_ITEMS.map((item) => (
              <div
                key={item.q}
                className="rounded-[var(--rp-radius)] border border-rp-slate-100 bg-rp-slate-50 p-6"
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
            Pronto para revelar o histórico da placa?
          </h2>
          <p className="mt-3 text-rp-primary-100">
            Digite a placa abaixo e veja os dados básicos em segundos. Grátis,
            sem cadastro e sem expor dados do proprietário.
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              href="/consulta"
              className="inline-flex items-center gap-2 rounded-[var(--rp-radius)] bg-white px-8 py-4 text-base font-semibold text-rp-primary-700 transition-colors hover:bg-rp-primary-50"
            >
              <Search className="size-5" />
              Consultar placa agora
              <ChevronRight className="size-5" />
            </Link>
          </div>
          <p className="mt-4 text-sm text-rp-primary-200">
            Relatório completo opcional — R$ 24,90. Acesso por 90 dias.
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
