"use client";

import { useState, useTransition } from "react";
import {
  testarFornecedorBasicoAction,
  testarFornecedorPremiumAction,
} from "@/app/actions/admin-saude";

type Resultado = { ok: boolean; latenciaMs: number; erro?: string };

function BotaoTeste({
  label,
  action,
}: {
  label: string;
  action: () => Promise<Resultado>;
}) {
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div className="rounded-xl border border-rp-slate-100 p-4">
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const r = await action();
            setResultado(r);
          })
        }
        className="rounded-lg bg-rp-primary-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
      >
        {pending ? "Testando…" : label}
      </button>
      {resultado && (
        <p
          className={`mt-3 text-sm ${resultado.ok ? "text-rp-success" : "text-rp-danger"}`}
        >
          {resultado.ok ? "OK" : "Erro"} — {resultado.latenciaMs} ms
          {resultado.erro ? ` — ${resultado.erro}` : ""}
        </p>
      )}
    </div>
  );
}

export function HealthTestButtons() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <BotaoTeste label="Testar fornecedor básico" action={testarFornecedorBasicoAction} />
      <BotaoTeste label="Testar fornecedor premium" action={testarFornecedorPremiumAction} />
    </div>
  );
}
