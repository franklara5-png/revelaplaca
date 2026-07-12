import type { Metadata } from "next";
import Link from "next/link";
import { getSeoMetadata } from "@/lib/seo";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/site-url";

export const metadata: Metadata = getSeoMetadata({
  title: `Sobre o ${SITE_NAME}`,
  description: `Conheça o ${SITE_NAME}: ${SITE_TAGLINE} Operado pela Altivia Tecnologia e Serviços Digitais LTDA.`,
  path: "/sobre",
});

export default function SobrePage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-bold text-rp-ink">Sobre o {SITE_NAME}</h1>

      <div className="mt-8 space-y-6 text-sm leading-relaxed text-rp-slate-600 md:text-base">
        <p>
          O {SITE_NAME} é uma plataforma brasileira de consulta veicular pela
          placa, oferecendo dados sobre leilão, sinistro, roubo/furto, gravame,
          restrições e débitos. Nossas informações são obtidas de fontes públicas
          e parceiros autorizados, sempre respeitando a LGPD — não exibimos dados
          pessoais do proprietário.
        </p>

        <p>
          O serviço é operado pela{" "}
          <strong className="text-rp-ink">
            Altivia Tecnologia e Serviços Digitais LTDA
          </strong>
          , CNPJ 63.101.423/0001-18, com sede em São Paulo, SP. Empresa
          brasileira registrada, com atuação no mercado de tecnologia e serviços
          digitais.
        </p>

        <h2 className="mt-10 text-xl font-bold text-rp-ink">
          Nossos diferenciais
        </h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>Consulta gratuita com dados básicos em segundos.</li>
          <li>Relatório completo via Pix ou cartão, com entrega por e-mail.</li>
          <li>Informações sempre atualizadas das bases de dados oficiais.</li>
          <li>Atendimento humano via WhatsApp e e-mail.</li>
        </ul>

        <h2 className="mt-10 text-xl font-bold text-rp-ink">Canais de contato</h2>
        <ul className="space-y-2">
          <li>
            Email:{" "}
            <a href="mailto:contato@checaplaca.com.br" className="text-rp-primary-700 underline">
              contato@checaplaca.com.br
            </a>
          </li>
          <li>
            WhatsApp:{" "}
            <a
              href="https://wa.me/5511915984661"
              className="text-rp-primary-700 underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              +55 (11) 91598-4661
            </a>
          </li>
          <li>São Paulo, Brasil</li>
        </ul>

        <h2 className="mt-10 text-xl font-bold text-rp-ink">Links úteis</h2>
        <div className="grid gap-2 sm:grid-cols-2">
          <Link href="/termos" className="text-rp-primary-700 underline">
            Termos de Uso
          </Link>
          <Link href="/privacidade" className="text-rp-primary-700 underline">
            Política de Privacidade
          </Link>
          <Link href="/blog" className="text-rp-primary-700 underline">
            Blog
          </Link>
          <Link href="/fontes" className="text-rp-primary-700 underline">
            Fontes de dados
          </Link>
        </div>
      </div>
    </main>
  );
}
