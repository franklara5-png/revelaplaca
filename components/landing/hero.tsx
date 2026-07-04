import { PlacaSearchForm } from "./placa-search-form";
import { Shield, CheckCircle2 } from "lucide-react";
import { SITE_DESCRIPTION, SITE_TAGLINE } from "@/lib/site-url";

const TRUST_POINTS = [
  "Consulta básica gratuita",
  "Histórico do veículo, sem CPF ou nome",
  "Relatório completo por R$ 24,90",
];

export function Hero() {
  return (
    <section className="relative overflow-hidden px-4 pb-20 pt-32 md:pb-28 md:pt-36">
      <div className="rp-hero-glow pointer-events-none absolute inset-0" />
      <div className="relative mx-auto max-w-5xl text-center">
        <p className="rp-section-eyebrow">{SITE_TAGLINE}</p>
        <h1 className="rp-heading-xl mt-4 text-rp-ink">
          Revele o histórico
          <br />
          <span className="text-rp-primary">de qualquer veículo</span>
        </h1>
        <p className="rp-body mx-auto mt-6 max-w-2xl">{SITE_DESCRIPTION}</p>

        <div className="mt-10 flex justify-center">
          <PlacaSearchForm id="consultar" />
        </div>

        <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          {TRUST_POINTS.map((point) => (
            <li
              key={point}
              className="flex items-center gap-1.5 text-sm text-rp-slate-600"
            >
              <CheckCircle2 className="h-4 w-4 text-rp-success" />
              {point}
            </li>
          ))}
        </ul>

        <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-rp-primary-50 px-4 py-2 text-sm text-rp-primary-800">
          <Shield className="h-4 w-4" />
          Em conformidade com a LGPD — sem dados do proprietário
        </div>
      </div>
    </section>
  );
}
