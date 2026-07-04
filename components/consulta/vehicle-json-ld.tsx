import { getSiteUrl, SITE_NAME } from "@/lib/site-url";
import { formatarPlaca } from "@/lib/placa";
import { formatarValorFipe } from "@/lib/veiculos";
import type { ConsultaBasica } from "@/lib/fornecedores/types";

type Props = {
  placa: string;
  dados: ConsultaBasica;
};

export function VehicleJsonLd({ placa, dados }: Props) {
  const siteUrl = getSiteUrl();
  const nome =
    [dados.marca, dados.modelo, dados.anoModelo ?? dados.anoFabricacao]
      .filter(Boolean)
      .join(" ") || `Veículo placa ${formatarPlaca(placa)}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Vehicle",
    name: nome,
    vehicleIdentificationNumber: dados.chassiParcial ?? undefined,
    brand: dados.marca
      ? { "@type": "Brand", name: dados.marca }
      : undefined,
    model: dados.modelo ?? undefined,
    color: dados.cor ?? undefined,
    fuelType: dados.combustivel ?? undefined,
    productionDate: dados.anoFabricacao
      ? `${dados.anoFabricacao}`
      : undefined,
    vehicleModelDate: dados.anoModelo ? `${dados.anoModelo}` : undefined,
    offers: dados.fipeValor
      ? {
          "@type": "Offer",
          price: dados.fipeValor,
          priceCurrency: "BRL",
          url: `${siteUrl}/consulta/${placa}`,
        }
      : undefined,
    url: `${siteUrl}/consulta/${placa}`,
    description: `Consulta veicular da placa ${formatarPlaca(placa)}. Valor FIPE: ${formatarValorFipe(dados.fipeValor)}.`,
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: siteUrl,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
