"use client";

import { useMemo, useState } from "react";
import { enviarEventoCliente } from "@/components/analytics/track-evento";
import { Card } from "@/components/ui";
import {
  compararPrecoComFipe,
  formatarPrecoBrl,
  parsePrecoBrl,
} from "@/lib/fipe-comparador";

type Props = {
  placa: string;
  fipeValor: number | null | undefined;
};

const BADGE_CLASS: Record<string, string> = {
  ok: "bg-rp-emerald-500/10 text-rp-emerald-700",
  warn: "bg-amber-500/10 text-amber-800",
  danger: "bg-rp-red-500/10 text-rp-red-600",
  neutral: "bg-rp-slate-100 text-rp-slate-600",
};

export function ComparadorFipe({ placa, fipeValor }: Props) {
  const [precoTexto, setPrecoTexto] = useState("");
  const [comparou, setComparou] = useState(false);

  const preco = parsePrecoBrl(precoTexto);
  const resultado = useMemo(
    () => (preco ? compararPrecoComFipe(preco, fipeValor) : null),
    [preco, fipeValor],
  );

  function handleComparar() {
    if (!preco || !resultado || comparou) return;
    setComparou(true);
    void enviarEventoCliente("comparou_fipe", placa, {
      percentual: resultado.percentual ?? undefined,
    });
  }

  return (
    <Card>
      <p className="rp-section-eyebrow">Comparador FIPE</p>
      <h2 className="mt-1 text-lg font-bold text-rp-slate-900">
        O preço pedido está justo?
      </h2>
      <p className="mt-2 text-sm text-rp-slate-600">
        Referência FIPE deste veículo:{" "}
        <strong>
          {fipeValor ? formatarPrecoBrl(fipeValor) : "—"}
        </strong>
      </p>

      <div className="mt-4">
        <label htmlFor="preco-pedido" className="text-sm font-medium text-rp-slate-900">
          Preço pedido pelo vendedor (R$)
        </label>
        <input
          id="preco-pedido"
          type="text"
          inputMode="decimal"
          placeholder="Ex.: 45.900"
          value={precoTexto}
          onChange={(e) => {
            setPrecoTexto(e.target.value);
            setComparou(false);
          }}
          className="mt-2 w-full rounded-2xl border border-rp-slate-200 bg-white px-4 py-3 text-sm text-rp-slate-900 outline-none focus:border-rp-primary-500"
        />
      </div>

      {resultado && preco && (
        <div className="mt-4 rounded-2xl border border-rp-slate-100 bg-rp-slate-50 p-4">
          <div className="flex flex-wrap items-center gap-3">
            <span
              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${BADGE_CLASS[resultado.variant]}`}
            >
              {resultado.label}
            </span>
            <span className="text-sm text-rp-slate-600">
              {formatarPrecoBrl(preco)} vs FIPE{" "}
              {fipeValor ? formatarPrecoBrl(fipeValor) : "—"}
            </span>
          </div>
          {resultado.faixa === "abaixo" && (
            <p className="mt-3 text-sm text-rp-slate-600">
              Preços muito abaixo da FIPE podem indicar histórico oculto. Vale
              investigar leilão, sinistro e restrições no relatório completo.
            </p>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={handleComparar}
        disabled={!preco || comparou}
        className="mt-4 text-sm font-semibold text-rp-primary-700 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
      >
        {comparou ? "Comparação registrada" : "Comparar com FIPE"}
      </button>
    </Card>
  );
}
