import Link from "next/link";
import { cn } from "@/lib/utils";
import type { PeriodoAdmin } from "@/lib/admin/periodo";

const OPCOES: { valor: PeriodoAdmin; label: string }[] = [
  { valor: "hoje", label: "Hoje" },
  { valor: "7d", label: "7 dias" },
  { valor: "30d", label: "30 dias" },
];

type Props = {
  atual: PeriodoAdmin;
  basePath?: string;
};

export function PeriodoSelect({ atual, basePath = "/admin" }: Props) {
  return (
    <div className="inline-flex rounded-xl border border-rp-slate-100 bg-white p-1">
      {OPCOES.map((op) => (
        <Link
          key={op.valor}
          href={`${basePath}?periodo=${op.valor}`}
          className={cn(
            "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
            atual === op.valor
              ? "bg-rp-primary-900 text-white"
              : "text-rp-slate-600 hover:bg-rp-slate-50",
          )}
        >
          {op.label}
        </Link>
      ))}
    </div>
  );
}
