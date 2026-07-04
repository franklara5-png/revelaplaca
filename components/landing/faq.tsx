import { Section } from "@/components/ui";
import { getSiteUrl, SITE_NAME } from "@/lib/site-url";

export const FAQ_ITEMS = [
  {
    question: "A consulta básica é realmente grátis?",
    answer:
      "Sim. Você pode consultar marca, modelo, ano, cor, município e valor FIPE sem pagar nada. O relatório completo com leilão, sinistro e restrições custa R$ 24,90.",
  },
  {
    question: "Vocês revelam quem é o dono do veículo?",
    answer:
      "Não. Por respeito à LGPD, revelamos apenas dados do veículo (histórico, leilão, sinistro, restrições) — nunca dados do proprietário. Desconfie de sites que prometem revelar o dono pela placa.",
  },
  {
    question: "Vocês exibem dados do proprietário?",
    answer:
      "Não. Em conformidade com a LGPD, exibimos apenas dados do veículo. Nome, CPF, CNPJ e endereço do proprietário nunca são mostrados nem armazenados em páginas públicas.",
  },
  {
    question: "Quais placas são aceitas?",
    answer:
      "Aceitamos o formato antigo (ABC1234) e o padrão Mercosul (ABC1D23). A placa é normalizada automaticamente antes da consulta.",
  },
  {
    question: "Como recebo o relatório completo?",
    answer:
      "Após o pagamento via Pix ou cartão, você recebe um link por e-mail com acesso ao relatório por 90 dias. Não é necessário criar conta. Confira um exemplo em /exemplo antes de comprar.",
  },
  {
    question: "De onde vêm os dados?",
    answer:
      "Combinamos fontes públicas oficiais, tabela FIPE e parceiros de dados veiculares autorizados. Detalhes em /fontes. Os dados podem variar conforme disponibilidade nas bases consultadas.",
  },
  {
    question: "Posso consultar antes de comprar um carro usado?",
    answer:
      "Sim, e é exatamente para isso que o serviço existe. A consulta grátis já ajuda a identificar o veículo; o relatório completo revela riscos ocultos como leilão, sinistro ou gravame.",
  },
];

export function Faq() {
  return (
    <Section id="faq" variant="white">
      <div className="mx-auto max-w-3xl">
        <p className="rp-section-eyebrow text-center">Dúvidas frequentes</p>
        <h2 className="rp-section-heading mt-2 text-center">Perguntas e respostas</h2>
        <dl className="mt-10 space-y-6">
          {FAQ_ITEMS.map((item) => (
            <div
              key={item.question}
              className="rounded-[var(--rp-radius)] border border-rp-slate-100 bg-rp-slate-50 p-6"
            >
              <dt className="font-semibold text-rp-slate-900">{item.question}</dt>
              <dd className="mt-2 text-sm leading-relaxed text-rp-slate-600">
                {item.answer}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </Section>
  );
}

export function FaqJsonLd() {
  const siteUrl = getSiteUrl();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: siteUrl,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
