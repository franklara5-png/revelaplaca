import { notFound } from "next/navigation";
import Link from "next/link";
import { CheckoutFlow, CheckoutFaq } from "@/components/checkout";
import { CheckoutViewTracker } from "@/components/analytics/checkout-view-tracker";
import { Card } from "@/components/ui";
import { mascararEmail } from "@/lib/admin/auth";
import { getSeoMetadata } from "@/lib/seo";
import { buscarPedido } from "@/lib/pedidos";
import { formatarPlaca, normalizarPlaca, validarPlaca } from "@/lib/placa";
import { buscarVeiculoCache, veiculoParaResposta } from "@/lib/veiculos";
import { PRECO_RELATORIO_REAIS } from "@/lib/constants/pagamento";
import { getSession } from "@/lib/get-session";

type Props = {
  params: Promise<{ placa: string }>;
  searchParams: Promise<{ pedido?: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { placa: placaParam } = await params;
  const placa = normalizarPlaca(placaParam);

  return getSeoMetadata({
    title: `Checkout — placa ${formatarPlaca(placa)}`,
    description: `Relatório veicular completo por ${PRECO_RELATORIO_REAIS.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} via Pix ou cartão.`,
    path: `/checkout/${placa}`,
    noindex: true,
  });
}

export default async function CheckoutPage({ params, searchParams }: Props) {
  const { placa: placaParam } = await params;
  const { pedido: pedidoId } = await searchParams;
  const placa = normalizarPlaca(placaParam);

  // Sessão opcional — pré-preenche email se logado
  const session = await getSession().catch(() => null);
  const defaultEmail = session?.user?.email;

  if (!validarPlaca(placa)) {
    notFound();
  }

  let pedidoRetomada: { id: string; emailMascarado: string } | undefined;

  if (pedidoId) {
    const pedido = await buscarPedido(pedidoId).catch(() => null);
    if (
      !pedido ||
      pedido.placa !== placa ||
      pedido.status !== "pendente"
    ) {
      notFound();
    }
    pedidoRetomada = {
      id: pedido.id,
      emailMascarado: mascararEmail(pedido.email),
    };
  }

  const cache = await buscarVeiculoCache(placa).catch(() => null);
  const veiculoResumo = cache
    ? [
        veiculoParaResposta(cache).marca,
        veiculoParaResposta(cache).modelo,
        veiculoParaResposta(cache).anoModelo ?? veiculoParaResposta(cache).anoFabricacao,
      ]
        .filter(Boolean)
        .join(" · ")
    : null;

  return (
    <div className="px-4 pb-20 pt-28">
      <CheckoutViewTracker placa={placa} />
      <div className="mx-auto max-w-lg">
        <CheckoutFlow
          placa={placa}
          veiculoResumo={veiculoResumo}
          pedidoRetomada={pedidoRetomada}
          defaultEmail={defaultEmail}
        />

        <Card className="mt-6 bg-rp-slate-50">
          <h3 className="text-sm font-semibold text-rp-slate-900">
            O que está incluso
          </h3>
          <ul className="mt-3 space-y-1 text-sm text-rp-slate-600">
            <li>• Histórico de leilão e remarketing</li>
            <li>• Indício de sinistro / perda total</li>
            <li>• Roubo, furto e gravame</li>
            <li>• Restrições judiciais e débitos</li>
            <li>• Acesso por link por 90 dias — sem cadastro</li>
          </ul>
          <Link
            href="/exemplo"
            className="mt-4 inline-block text-sm font-semibold text-rp-primary-700 hover:underline"
          >
            Ver exemplo do relatório completo →
          </Link>
          <Link
            href={`/consulta/${placa}`}
            className="mt-2 block text-sm font-semibold text-rp-primary-700 hover:underline"
          >
            ← Voltar à consulta grátis
          </Link>
        </Card>

        <CheckoutFaq />
      </div>
    </div>
  );
}
