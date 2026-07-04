import { Lock, AlertTriangle, Gavel, CarFront, FileWarning, Receipt } from "lucide-react";
import { Card, Section } from "@/components/ui";

const VERIFICACOES = [
  { icon: Gavel, label: "Leilão e remarketing", desc: "Histórico em leilões e revendas" },
  { icon: AlertTriangle, label: "Sinistro", desc: "Indício de perda total ou parcial" },
  { icon: CarFront, label: "Roubo e furto", desc: "Consulta em bases oficiais" },
  { icon: FileWarning, label: "Gravame", desc: "Alienação fiduciária e restrições" },
  { icon: Lock, label: "Restrição judicial", desc: "Bloqueios e impedimentos" },
  { icon: Receipt, label: "Débitos", desc: "IPVA, licenciamento e multas" },
];

export function RelatorioPreview() {
  return (
    <Section id="relatorio" variant="white">
      <div className="mx-auto max-w-5xl">
        <p className="rp-section-eyebrow text-center">Relatório completo</p>
        <h2 className="rp-section-heading mt-2 text-center">
          O que vem no relatório premium
        </h2>
        <p className="rp-body mx-auto mt-4 max-w-2xl text-center">
          Na consulta grátis você vê os dados básicos. O relatório completo revela
          o histórico que importa na hora de comprar ou vender.
        </p>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {VERIFICACOES.map((item) => (
            <Card key={item.label} className="flex gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-rp-primary-50 text-rp-primary-900">
                <item.icon className="h-5 w-5" />
              </span>
              <div>
                <h3 className="font-semibold text-rp-slate-900">{item.label}</h3>
                <p className="mt-1 text-sm text-rp-slate-600">{item.desc}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </Section>
  );
}
