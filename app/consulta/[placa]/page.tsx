import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  ConsultaCtaMobile,
  ConsultaResultado,
  ConsultaTurnstileGate,
  VehicleJsonLd,
} from "@/components/consulta";
import { FaqJsonLd } from "@/components/landing/faq";
import { getSeoMetadata } from "@/lib/seo";
import { getSiteUrl, SITE_NAME } from "@/lib/site-url";
import { formatarPlaca, normalizarPlaca, validarPlaca } from "@/lib/placa";
import {
  buscarOutrosModelo,
  buscarVeiculoCache,
  veiculoParaResposta,
} from "@/lib/veiculos";

type PageProps = {
  params: Promise<{ placa: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { placa: placaParam } = await params;
  const placa = normalizarPlaca(placaParam);

  if (!validarPlaca(placa)) {
    return getSeoMetadata({
      title: "Placa inválida",
      description: "O formato da placa informado não é válido.",
      path: `/consulta/${placaParam}`,
      noindex: true,
    });
  }

  const cache = await buscarVeiculoCache(placa).catch(() => null);
  const placaFmt = formatarPlaca(placa);

  if (cache?.marca && cache?.modelo) {
    const ano = cache.anoModelo ?? cache.anoFabricacao ?? "";
    const title = `Placa ${placaFmt} — ${cache.marca} ${cache.modelo} ${ano}`.trim();
    const description = `Consulta gratuita da placa ${placaFmt}: ${cache.marca} ${cache.modelo}${ano ? ` ${ano}` : ""}${cache.cor ? `, cor ${cache.cor}` : ""}. Veja valor FIPE e histórico veicular.`;

    return getSeoMetadata({
      title,
      description,
      path: `/consulta/${placa}`,
      ogImage: `${getSiteUrl()}/og/${placa}`,
    });
  }

  return getSeoMetadata({
    title: `Placa ${placaFmt} — Consulta veicular grátis`,
    description: `Consulte a placa ${placaFmt} gratuitamente. Veja marca, modelo, ano, cor, município e valor FIPE em ${SITE_NAME}.`,
    path: `/consulta/${placa}`,
  });
}

export default async function ConsultaVeicularPage({ params }: PageProps) {
  const { placa: placaParam } = await params;
  const placa = normalizarPlaca(placaParam);

  if (!validarPlaca(placa)) {
    notFound();
  }

  const cache = await buscarVeiculoCache(placa).catch(() => null);

  if (!cache) {
    return (
      <div className="px-4 pb-20 pt-28">
        <div className="mx-auto max-w-3xl text-center">
          <p className="rp-section-eyebrow">Consulta veicular</p>
          <h1 className="rp-section-heading mt-2">
            Placa {formatarPlaca(placa)}
          </h1>
          <p className="rp-body mx-auto mt-4 max-w-xl">
            Confirme abaixo para consultar os dados básicos deste veículo
            gratuitamente.
          </p>
        </div>
        <div className="mx-auto mt-10 max-w-3xl">
          <ConsultaTurnstileGate placa={placa} />
        </div>
      </div>
    );
  }

  const dados = veiculoParaResposta(cache);
  const outrosModelo = dados.modelo
    ? await buscarOutrosModelo(dados.modelo, placa).catch(() => [])
    : [];

  return (
    <>
      <VehicleJsonLd placa={placa} dados={dados} />
      <FaqJsonLd />
      <div className="px-4 pb-24 pt-28">
        <div className="mx-auto max-w-3xl">
          <ConsultaResultado
            placa={placa}
            dados={dados}
            outrosModelo={outrosModelo}
          />
        </div>
      </div>
      <ConsultaCtaMobile placa={placa} />
    </>
  );
}
