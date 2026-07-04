import { Card, Section } from "@/components/ui";

const STEPS = [
  {
    num: "1",
    title: "Digite a placa",
    text: "Informe a placa no formato antigo ou Mercosul. A consulta básica é gratuita.",
  },
  {
    num: "2",
    title: "Veja os dados básicos",
    text: "Marca, modelo, ano, cor, município e valor FIPE aparecem na hora.",
  },
  {
    num: "3",
    title: "Relatório completo (opcional)",
    text: "Leilão, sinistro, roubo/furto, gravame e restrições por R$ 24,90 via Pix ou cartão.",
  },
];

export function ComoFunciona() {
  return (
    <Section id="como-funciona" variant="light">
      <div className="mx-auto max-w-5xl">
        <p className="rp-section-eyebrow text-center">Como funciona</p>
        <h2 className="rp-section-heading mt-2 text-center">
          Três passos para revelar
        </h2>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {STEPS.map((step) => (
            <Card key={step.num} className="text-center">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-rp-primary-900 text-lg font-bold text-white">
                {step.num}
              </span>
              <h3 className="mt-4 text-lg font-semibold text-rp-slate-900">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-rp-slate-600">
                {step.text}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </Section>
  );
}
