import { cn } from "@/lib/utils";

export type StatusVariant = "ok" | "alerta" | "risco" | "desconhecido";

const STYLES: Record<StatusVariant, string> = {
  ok: "bg-rp-success/10 text-rp-success border-rp-success/20",
  alerta: "bg-rp-warning/10 text-rp-warning border-rp-warning/20",
  risco: "bg-rp-danger/10 text-rp-danger border-rp-danger/20",
  desconhecido: "bg-rp-slate-100 text-rp-slate-600 border-rp-slate-200",
};

const LABELS: Record<StatusVariant, string> = {
  ok: "OK",
  alerta: "Alerta",
  risco: "Risco",
  desconhecido: "Desconhecido",
};

type Props = {
  variant: StatusVariant;
  label?: string;
  className?: string;
};

export function StatusBadge({ variant, label, className }: Props) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        STYLES[variant],
        className,
      )}
    >
      {label ?? LABELS[variant]}
    </span>
  );
}
