import { Check, X } from "lucide-react";
import { Card, Section } from "@/components/ui";

const ROWS = [
  { feature: "Marca, modelo e ano", gratis: true, completo: true },
  { feature: "Cor, município e combustível", gratis: true, completo: true },
  { feature: "Valor FIPE atualizado", gratis: true, completo: true },
  { feature: "Leilão e remarketing", gratis: false, completo: true },
  { feature: "Sinistro e perda total", gratis: false, completo: true },
  { feature: "Roubo, furto e gravame", gratis: false, completo: true },
  { feature: "Restrições e débitos", gratis: false, completo: true },
];

function CellIcon({ included }: { included: boolean }) {
  return included ? (
    <Check className="mx-auto h-5 w-5 text-rp-emerald-500" />
  ) : (
    <X className="mx-auto h-5 w-5 text-rp-slate-300" />
  );
}

export function Comparacao() {
  return (
    <Section variant="light">
      <div className="mx-auto max-w-3xl">
        <p className="rp-section-eyebrow text-center">Compare</p>
        <h2 className="rp-section-heading mt-2 text-center">
          Grátis vs relatório completo
        </h2>
        <Card className="mt-10 overflow-hidden p-0">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-rp-slate-100 bg-rp-slate-50">
                <th className="px-6 py-4 font-semibold text-rp-slate-900">Recurso</th>
                <th className="px-4 py-4 text-center font-semibold text-rp-slate-600">
                  Grátis
                </th>
                <th className="px-4 py-4 text-center font-semibold text-rp-primary-900">
                  Completo — R$ 24,90
                </th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row) => (
                <tr key={row.feature} className="border-b border-rp-slate-100 last:border-0">
                  <td className="px-6 py-4 text-rp-slate-700">{row.feature}</td>
                  <td className="px-4 py-4">
                    <CellIcon included={row.gratis} />
                  </td>
                  <td className="px-4 py-4">
                    <CellIcon included={row.completo} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </Section>
  );
}
