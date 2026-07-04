import {
  Hero,
  ComoFunciona,
  RelatorioPreview,
  Comparacao,
  Faq,
  FaqJsonLd,
} from "@/components/landing";
import { PlacaSearchForm } from "@/components/landing/placa-search-form";
import { Section } from "@/components/ui";
import { getSeoMetadata } from "@/lib/seo";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE } from "@/lib/site-url";

export const metadata = getSeoMetadata({
  title: `${SITE_NAME} — ${SITE_TAGLINE}`,
  description: SITE_DESCRIPTION,
  path: "/",
  keywords: ["revelar placa", "consulta placa", "leilão carro", "histórico veicular"],
});

export default function HomePage() {
  return (
    <>
      <FaqJsonLd />
      <Hero />
      <ComoFunciona />
      <RelatorioPreview />
      <Comparacao />
      <Faq />
      <Section variant="primary" className="text-center">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-2xl font-bold md:text-3xl">
            Pronto para revelar o histórico da placa?
          </h2>
          <p className="mt-3 text-rp-primary-100">
            Digite a placa abaixo e veja os dados básicos em segundos.
          </p>
          <div className="mt-8 flex justify-center [&_input]:border-white/20 [&_input]:bg-white/10 [&_input]:text-white [&_input]:placeholder:text-white/50">
            <PlacaSearchForm />
          </div>
        </div>
      </Section>
    </>
  );
}
