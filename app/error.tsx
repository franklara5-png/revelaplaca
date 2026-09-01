"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RotateCw } from "lucide-react";
import { Button } from "@/components/ui";

/**
 * Fronteira de erro do app. Sem ela, qualquer excecao em Server Component
 * derrubava o visitante na tela crua do Next — sem header, sem rodape e sem
 * caminho de volta.
 *
 * Nao cobre erro no proprio layout raiz; esse caso e do global-error.tsx.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // O digest e o que liga esta tela a linha correspondente no log da Vercel.
    console.error("[app-error]", error.digest ?? "", error.message);
  }, [error]);

  return (
    <div className="mx-auto max-w-2xl px-4 pb-20 pt-32 text-center">
      <p className="text-sm font-semibold text-rp-primary">Algo quebrou aqui</p>
      <h1 className="mt-2 text-3xl font-bold text-rp-ink">
        Não conseguimos carregar esta página
      </h1>
      <p className="mt-4 text-sm leading-relaxed text-rp-slate-600 md:text-base">
        A falha foi do nosso lado, não do seu. Tentar de novo costuma resolver —
        se insistir, o problema já está registrado e vamos atrás.
      </p>

      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Button size="lg" onClick={reset}>
          <RotateCw className="h-4 w-4" />
          Tentar de novo
        </Button>
        <Button asChild variant="secondary" size="lg">
          <Link href="/">Voltar ao início</Link>
        </Button>
      </div>

      {error.digest && (
        <p className="mt-8 font-mono text-xs text-rp-slate-400">
          código: {error.digest}
        </p>
      )}
    </div>
  );
}
