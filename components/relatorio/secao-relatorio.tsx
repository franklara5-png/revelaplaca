import { Card, StatusBadge } from "@/components/ui";
import { formatarDataHora } from "@/lib/relatorio/normalizar";
import type { SecaoRelatorio } from "@/lib/relatorio/types";

function formatarValor(valor: unknown): string {
  if (valor === null || valor === undefined) return "—";
  if (typeof valor === "boolean") return valor ? "Sim" : "Não";
  if (typeof valor === "object") return JSON.stringify(valor, null, 2);
  return String(valor);
}

const BADGE_LABEL: Record<SecaoRelatorio["status"], string> = {
  ok: "Nada consta",
  alerta: "Verificar",
  risco: "Atenção",
  desconhecido: "Indisponível",
};

const BADGE_VARIANT: Record<
  SecaoRelatorio["status"],
  "ok" | "alerta" | "risco" | "desconhecido"
> = {
  ok: "ok",
  alerta: "alerta",
  risco: "risco",
  desconhecido: "desconhecido",
};

type Props = {
  secao: SecaoRelatorio;
};

export function SecaoRelatorioCard({ secao }: Props) {
  const { titulo, status, fonte, consultadoEm, dados } = secao;

  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-bold text-rp-slate-900">{titulo}</h3>
        <StatusBadge variant={BADGE_VARIANT[status]} label={BADGE_LABEL[status]} />
      </div>

      {status === "ok" && fonte && consultadoEm && (
        <p className="mt-3 text-sm text-rp-slate-600">
          Nada consta — verificado em {fonte} em {formatarDataHora(consultadoEm)}
        </p>
      )}

      {status === "desconhecido" && (
        <p className="mt-3 text-sm text-rp-slate-600">
          Fonte indisponível no momento da consulta.
        </p>
      )}

      {(status === "alerta" || status === "risco") && dados && (
        <dl className="mt-4 space-y-3">
          {Object.entries(dados).map(([chave, valor]) => (
            <div
              key={chave}
              className="rounded-xl border border-rp-slate-100 bg-rp-slate-50 px-4 py-3"
            >
              <dt className="text-xs font-semibold uppercase tracking-wide text-rp-slate-400">
                {chave.replace(/_/g, " ")}
              </dt>
              <dd className="mt-1 whitespace-pre-wrap text-sm text-rp-slate-800">
                {formatarValor(valor)}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </Card>
  );
}
