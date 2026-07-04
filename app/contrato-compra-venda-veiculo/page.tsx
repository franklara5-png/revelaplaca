import Link from "next/link";
import { ContratoForm } from "@/components/contrato/contrato-form";
import { Card } from "@/components/ui";
import { getSeoMetadata } from "@/lib/seo";
import { formatarPlaca, normalizarPlaca, validarPlaca } from "@/lib/placa";
import { buscarVeiculoCache, veiculoParaResposta } from "@/lib/veiculos";

export const metadata = getSeoMetadata({
  title: "Contrato de compra e venda de veículo (PDF grátis) | RevelaPlaca",
  description:
    "Gere um modelo de contrato de compra e venda de carro em PDF. Preencha os dados, baixe e imprima. Pré-preenchimento pela placa quando disponível.",
  path: "/contrato-compra-venda-veiculo",
  keywords: [
    "contrato compra venda veículo",
    "contrato carro usado PDF",
    "modelo contrato veículo",
  ],
});

type Props = {
  searchParams: Promise<{ placa?: string }>;
};

export default async function ContratoPage({ searchParams }: Props) {
  const { placa: placaParam } = await searchParams;
  let avisoPlaca: string | null = null;
  let valoresIniciais: Record<string, string> | undefined;

  if (placaParam) {
    const placa = normalizarPlaca(placaParam);
    if (validarPlaca(placa)) {
      const cache = await buscarVeiculoCache(placa).catch(() => null);
      if (cache) {
        const v = veiculoParaResposta(cache);
        const ano = [v.anoFabricacao, v.anoModelo].filter(Boolean).join("/");
        valoresIniciais = {
          veiculoPlaca: placa,
          veiculoMarca: v.marca ?? "",
          veiculoModelo: v.modelo ?? "",
          veiculoAno: ano,
          veiculoCor: v.cor ?? "",
          veiculoChassi: v.chassiParcial ?? "",
        };
        avisoPlaca = `Dados do veículo pré-preenchidos a partir da consulta da placa ${formatarPlaca(placa)}.`;
      } else {
        avisoPlaca = `Placa ${formatarPlaca(placa)} reconhecida. Consulte o veículo antes para pré-preencher marca e modelo.`;
        valoresIniciais = { veiculoPlaca: placa };
      }
    }
  }

  return (
    <div className="px-4 pb-20 pt-28">
      <div className="mx-auto max-w-2xl">
        <p className="rp-section-eyebrow">Documento</p>
        <h1 className="rp-section-heading mt-2">
          Contrato de compra e venda de veículo
        </h1>
        <p className="rp-body mt-4">
          Modelo em PDF com cláusulas padrão, campos das partes, dados do veículo,
          duas testemunhas e espaço para assinaturas. Gratuito e sem cadastro.
        </p>

        {avisoPlaca && (
          <Card className="mt-6 border-rp-primary-100 bg-rp-primary-50 text-sm text-rp-primary-900">
            {avisoPlaca}{" "}
            {!valoresIniciais?.veiculoMarca && placaParam && (
              <Link
                href={`/consulta/${normalizarPlaca(placaParam)}`}
                className="font-semibold underline"
              >
                Consultar placa grátis
              </Link>
            )}
          </Card>
        )}

        <div className="mt-10">
          <ContratoForm valoresIniciais={valoresIniciais} />
        </div>

        <p className="mt-8 text-center text-sm text-rp-slate-600">
          Antes de fechar negócio,{" "}
          <Link href="/fontes" className="font-semibold text-rp-primary-700 hover:underline">
            saiba de onde vêm nossos dados
          </Link>{" "}
          e consulte o histórico do veículo.
        </p>
      </div>
    </div>
  );
}
