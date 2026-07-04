import Link from "next/link";
import {
  Lock,
  Gavel,
  CarFront,
  FileWarning,
  Receipt,
  AlertTriangle,
} from "lucide-react";
import { Card, StatusBadge } from "@/components/ui";
import { CtaRelatorioLink } from "@/components/consulta/cta-relatorio-link";
import type { ConsultaBasica } from "@/lib/fornecedores/types";

const VERIFICACOES = [
  { icon: Gavel, label: "Leilão" },
  { icon: AlertTriangle, label: "Sinistro" },
  { icon: CarFront, label: "Roubo/furto" },
  { icon: FileWarning, label: "Gravame" },
  { icon: Lock, label: "Restrição judicial" },
  { icon: Receipt, label: "Débitos" },
];

type Props = {
  placa: string;
  dados: ConsultaBasica;
};

export function IndiceRisco({ placa, dados }: Props) {
  const titulo =
    dados.marca && dados.modelo
      ? `${dados.marca} ${dados.modelo}`
      : "este veículo";

  return (
    <Card>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="rp-section-eyebrow">Raio-X RevelaPlaca</p>
          <h2 className="mt-1 text-lg font-bold text-rp-slate-900">
            Verificações do relatório completo
          </h2>
          <p className="mt-2 text-sm text-rp-slate-600">
            Saiba se {titulo} passou por leilão, sinistro ou possui restrições —
            disponível no relatório completo.
          </p>
        </div>
        <Lock className="h-5 w-5 shrink-0 text-rp-primary-700" />
      </div>

      <ul className="mt-6 grid gap-3 sm:grid-cols-2">
        {VERIFICACOES.map((item) => (
          <li
            key={item.label}
            className="flex items-center justify-between rounded-2xl border border-rp-slate-100 bg-rp-slate-50 px-4 py-3"
          >
            <span className="flex items-center gap-2 text-sm font-medium text-rp-slate-700">
              <item.icon className="h-4 w-4 text-rp-primary-700" />
              {item.label}
            </span>
            <StatusBadge
              variant="ok"
              className="select-none blur-sm"
              aria-hidden
            />
          </li>
        ))}
      </ul>

      <div className="mt-6 hidden rounded-2xl bg-rp-primary-900 p-4 text-white sm:block">
        <p className="font-semibold">Relatório completo — R$ 24,90</p>
        <p className="mt-1 text-sm text-rp-primary-100">
          Pagamento via Pix ou cartão. Acesso imediato por link, sem cadastro.
        </p>
        <CtaRelatorioLink
          placa={placa}
          href={`/checkout/${placa}`}
          className="mt-4 inline-flex h-11 items-center justify-center rounded-full bg-white px-6 text-sm font-semibold text-rp-primary-900 transition-colors hover:bg-rp-primary-50"
        >
          Ver relatório completo
        </CtaRelatorioLink>
        <Link
          href="/exemplo"
          className="mt-3 block text-center text-xs text-rp-primary-100 underline hover:no-underline"
        >
          Ver um exemplo do relatório completo
        </Link>
      </div>
    </Card>
  );
}
