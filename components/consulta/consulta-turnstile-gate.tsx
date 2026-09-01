"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Turnstile } from "@marsidev/react-turnstile";
import { Loader2, ShieldCheck } from "lucide-react";
import { Button, Card } from "@/components/ui";
import { formatarPlaca } from "@/lib/placa";

type Props = {
  placa: string;
};

/**
 * Portao anti-bot da consulta gratuita.
 *
 * A consulta dispara SOZINHA assim que o Turnstile devolve o token. Antes o
 * visitante clicava "Revelar gratis" na home, era levado para ca, resolvia o
 * desafio e ainda precisava clicar de novo — tres passos para receber o que
 * a home prometia em um. O botao continua existindo como saida manual quando
 * algo falha.
 */
export function ConsultaTurnstileGate({ placa }: Props) {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  // O Turnstile renova o token sozinho de tempos em tempos. Sem esta trava,
  // uma consulta que falhou seria refeita a cada renovacao — e cada tentativa
  // custa uma chamada ao fornecedor, que e paga.
  const jaDisparou = useRef(false);

  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const turnstileAtivo = Boolean(siteKey);

  const consultar = useCallback(async () => {
    if (turnstileAtivo && !token) {
      setErro("Complete a verificação de segurança antes de continuar.");
      return;
    }

    jaDisparou.current = true;
    setCarregando(true);
    setErro(null);

    try {
      const res = await fetch("/api/consulta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          placa,
          turnstileToken: token ?? undefined,
          origem: "direct",
        }),
      });

      const data = (await res.json()) as { erro?: string; ok?: boolean };

      if (!res.ok) {
        setErro(data.erro ?? "Não foi possível concluir a consulta.");
        return;
      }

      router.refresh();
    } catch {
      setErro("Erro de conexão. Verifique sua internet e tente novamente.");
    } finally {
      setCarregando(false);
    }
  }, [placa, router, token, turnstileAtivo]);

  useEffect(() => {
    if (!turnstileAtivo) return;
    if (!token) return;
    if (jaDisparou.current || carregando) return;
    void consultar();
  }, [token, turnstileAtivo, carregando, consultar]);

  const aguardandoVerificacao = turnstileAtivo && !token && !erro;

  return (
    <Card className="mx-auto max-w-lg text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rp-primary-50 text-rp-primary-900">
        <ShieldCheck className="h-6 w-6" />
      </div>
      <h2 className="mt-4 text-xl font-bold text-rp-slate-900">
        Consulta da placa {formatarPlaca(placa)}
      </h2>
      <p className="mt-2 text-sm text-rp-slate-600">
        Uma verificação rápida contra robôs e a consulta começa sozinha. A
        consulta básica é gratuita.
      </p>

      {turnstileAtivo ? (
        <div className="mt-6 flex justify-center">
          <Turnstile
            siteKey={siteKey as string}
            onSuccess={setToken}
            onExpire={() => setToken(null)}
            onError={() => {
              setToken(null);
              setErro("Falha na verificação. Recarregue a página e tente de novo.");
            }}
            options={{ theme: "light", size: "normal" }}
          />
        </div>
      ) : (
        <p className="mt-4 rounded-xl bg-rp-amber-500/10 px-4 py-3 text-sm text-rp-slate-600">
          Turnstile não configurado — modo desenvolvimento.
        </p>
      )}

      {erro && (
        <p className="mt-4 text-sm text-rp-red-500" role="alert">
          {erro}
        </p>
      )}

      {/* aria-live: com o disparo automatico, o unico sinal de que algo esta
          acontecendo e a mudanca deste texto. */}
      <div aria-live="polite" className="sr-only">
        {carregando ? "Consultando a placa." : ""}
      </div>

      <Button
        className="mt-6 w-full"
        size="lg"
        disabled={carregando || aguardandoVerificacao}
        onClick={() => {
          jaDisparou.current = false;
          void consultar();
        }}
      >
        {carregando ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Consultando…
          </>
        ) : aguardandoVerificacao ? (
          "Verificando…"
        ) : erro ? (
          "Tentar de novo"
        ) : (
          "Consultar agora"
        )}
      </Button>
    </Card>
  );
}
