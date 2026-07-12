"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, Copy, Loader2, CreditCard, QrCode } from "lucide-react";
import { iniciarCheckout, retomarCheckout } from "@/app/actions/checkout";
import { enviarEventoCliente } from "@/components/analytics/track-evento";
import { Button, Card, Input } from "@/components/ui";
import { PRECO_RELATORIO_REAIS } from "@/lib/constants/pagamento";
import { formatarPlaca } from "@/lib/placa";

type PixData = {
  encodedImage: string;
  payload: string;
  expirationDate: string;
};

type Props = {
  placa: string;
  veiculoResumo?: string | null;
  pedidoRetomada?: { id: string; emailMascarado: string };
  defaultEmail?: string;
};

type Etapa = "form" | "pix" | "cartao" | "sucesso";

const POLL_INTERVAL_MS = 4_000;
const POLL_MAX_MS = 10 * 60 * 1000;

export function CheckoutFlow({ placa, veiculoResumo, pedidoRetomada, defaultEmail }: Props) {
  const [email, setEmail] = useState(defaultEmail ?? "");
  const [metodo, setMetodo] = useState<"PIX" | "CREDIT_CARD">("PIX");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [etapa, setEtapa] = useState<Etapa>("form");
  const [pedidoId, setPedidoId] = useState<string | null>(null);
  const [pix, setPix] = useState<PixData | null>(null);
  const [invoiceUrl, setInvoiceUrl] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);
  const [relatorioToken, setRelatorioToken] = useState<string | null>(null);
  const [aguardandoRelatorio, setAguardandoRelatorio] = useState(false);

  useEffect(() => {
    if (!pedidoId || etapa === "form" || etapa === "sucesso") return;

    const inicio = Date.now();

    const interval = setInterval(async () => {
      if (Date.now() - inicio > POLL_MAX_MS) {
        clearInterval(interval);
        return;
      }

      try {
        const res = await fetch(`/api/pedidos/${pedidoId}/status`);
        const data = (await res.json()) as {
          status: string;
          relatorioToken?: string | null;
        };

        if (data.status === "pago") {
          if (data.relatorioToken) {
            setRelatorioToken(data.relatorioToken);
            setAguardandoRelatorio(false);
            setEtapa("sucesso");
            clearInterval(interval);
          } else {
            setAguardandoRelatorio(true);
          }
        }
      } catch {
        /* continua polling */
      }
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [pedidoId, etapa]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setCarregando(true);
    setErro(null);

    const resultado = pedidoRetomada
      ? await retomarCheckout({ pedidoId: pedidoRetomada.id, metodo })
      : await iniciarCheckout({ placa, email, metodo });

    setCarregando(false);

    if (!resultado.ok) {
      setErro(resultado.erro);
      return;
    }

    setPedidoId(resultado.pedidoId);

    if (resultado.metodo === "CREDIT_CARD" && resultado.invoiceUrl) {
      void enviarEventoCliente("cartao_click", placa);
      setInvoiceUrl(resultado.invoiceUrl);
      setEtapa("cartao");
      window.open(resultado.invoiceUrl, "_blank", "noopener,noreferrer");
      return;
    }

    if (resultado.pix) {
      setPix(resultado.pix);
      setEtapa("pix");
    }
  }

  async function copiarPix() {
    if (!pix?.payload) return;
    await navigator.clipboard.writeText(pix.payload);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  if (etapa === "sucesso" && relatorioToken) {
    return (
      <Card className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rp-emerald-500/10 text-rp-emerald-500">
          <Check className="h-7 w-7" />
        </div>
        <h2 className="mt-4 text-xl font-bold text-rp-slate-900">
          Pagamento confirmado!
        </h2>
        <p className="mt-2 text-sm text-rp-slate-600">
          Seu relatório completo da placa {formatarPlaca(placa)} está pronto.
          {email && !pedidoRetomada && (
            <> Enviamos o link também para {email}.</>
          )}
        </p>
        <Button asChild className="mt-6 w-full" size="lg">
          <Link href={`/relatorio/${relatorioToken}`}>Abrir relatório completo</Link>
        </Button>
      </Card>
    );
  }

  if (etapa === "pix" && pix) {
    return (
      <Card>
        <h2 className="text-lg font-bold text-rp-slate-900">Pague via Pix</h2>
        <p className="mt-1 text-sm text-rp-slate-600">
          Escaneie o QR Code ou copie o código. Valor:{" "}
          {PRECO_RELATORIO_REAIS.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })}
        </p>

        <div className="mt-6 flex justify-center">
          <Image
            src={`data:image/png;base64,${pix.encodedImage}`}
            alt="QR Code Pix"
            width={220}
            height={220}
            className="rounded-2xl border border-rp-slate-100"
            unoptimized
          />
        </div>

        <div className="mt-4">
          <label className="text-xs font-semibold uppercase tracking-wide text-rp-slate-400">
            Pix copia e cola
          </label>
          <div className="mt-2 flex gap-2">
            <Input
              readOnly
              value={pix.payload}
              className="text-xs normal-case tracking-normal"
            />
            <Button type="button" variant="secondary" onClick={copiarPix}>
              {copiado ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-sm text-rp-slate-600">
          <Loader2 className="h-4 w-4 animate-spin text-rp-primary-700" />
          {aguardandoRelatorio
            ? "Pagamento confirmado — gerando relatório…"
            : "Aguardando confirmação do pagamento…"}
        </div>
      </Card>
    );
  }

  if (etapa === "cartao" && invoiceUrl) {
    return (
      <Card className="text-center">
        <CreditCard className="mx-auto h-10 w-10 text-rp-primary-700" />
        <h2 className="mt-4 text-lg font-bold text-rp-slate-900">
          Complete o pagamento no cartão
        </h2>
        <p className="mt-2 text-sm text-rp-slate-600">
          Abrimos a página segura do Asaas em uma nova aba. Após pagar, volte aqui
          — detectamos automaticamente.
        </p>
        <Button asChild className="mt-6 w-full">
          <a href={invoiceUrl} target="_blank" rel="noopener noreferrer">
            Abrir pagamento novamente
          </a>
        </Button>
        <div className="mt-4 flex items-center justify-center gap-2 text-sm text-rp-slate-600">
          <Loader2 className="h-4 w-4 animate-spin" />
          {aguardandoRelatorio
            ? "Gerando relatório…"
            : "Aguardando confirmação…"}
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <p className="rp-section-eyebrow">Relatório completo</p>
      <h2 className="mt-1 text-xl font-bold text-rp-slate-900">
        Placa {formatarPlaca(placa)}
      </h2>
      {veiculoResumo && (
        <p className="mt-1 text-sm text-rp-slate-600">{veiculoResumo}</p>
      )}

      <p className="mt-4 text-3xl font-bold text-rp-primary-900">
        {PRECO_RELATORIO_REAIS.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        })}
      </p>
      <p className="mt-1 text-sm text-rp-slate-600">
        Leilão, sinistro, roubo/furto, gravame, restrições e débitos
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        {pedidoRetomada ? (
          <p className="rounded-2xl bg-rp-slate-50 px-4 py-3 text-sm text-rp-slate-600">
            Retomando pagamento para{" "}
            <span className="font-semibold text-rp-ink">
              {pedidoRetomada.emailMascarado}
            </span>
          </p>
        ) : (
          <div>
            <label htmlFor="email" className="text-sm font-medium text-rp-slate-900">
              E-mail para receber o relatório
            </label>
            <Input
              id="email"
              type="email"
              required
              autoComplete="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 normal-case tracking-normal"
            />
          </div>
        )}

        <fieldset>
          <legend className="text-sm font-medium text-rp-slate-900">
            Forma de pagamento
          </legend>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setMetodo("PIX")}
              className={`flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold transition-colors ${
                metodo === "PIX"
                  ? "border-rp-primary-700 bg-rp-primary-50 text-rp-primary-900"
                  : "border-rp-slate-100 text-rp-slate-600 hover:border-rp-slate-200"
              }`}
            >
              <QrCode className="h-4 w-4" />
              Pix
            </button>
            <button
              type="button"
              onClick={() => setMetodo("CREDIT_CARD")}
              className={`flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold transition-colors ${
                metodo === "CREDIT_CARD"
                  ? "border-rp-primary-700 bg-rp-primary-50 text-rp-primary-900"
                  : "border-rp-slate-100 text-rp-slate-600 hover:border-rp-slate-200"
              }`}
            >
              <CreditCard className="h-4 w-4" />
              Cartão
            </button>
          </div>
        </fieldset>

        {erro && (
          <p className="text-sm text-rp-red-500" role="alert">
            {erro}
          </p>
        )}

        <Button type="submit" className="w-full" size="lg" disabled={carregando}>
          {carregando ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Processando…
            </>
          ) : metodo === "PIX" ? (
            "Gerar Pix — pagar agora"
          ) : (
            "Pagar com cartão"
          )}
        </Button>

        <div className="mt-4 flex items-start gap-2 rounded-xl border border-rp-slate-100 bg-rp-slate-50 px-4 py-3">
          <svg className="mt-0.5 h-4 w-4 shrink-0 text-rp-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <p className="text-xs leading-relaxed text-rp-slate-500">
            Compra segura &bull; Empresa registrada no Brasil<br />
            <span className="font-medium text-rp-slate-600">Altivia &mdash; CNPJ 63.101.423/0001-18</span>
          </p>
        </div>
      </form>
    </Card>
  );
}
