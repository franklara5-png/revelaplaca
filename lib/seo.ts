import type { Metadata } from "next";
import {
  getSiteUrl,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TAGLINE,
} from "./site-url";
import { PRECO_RELATORIO_REAIS } from "./constants/pagamento";

export type SeoMetadataInput = {
  title: string;
  description: string;
  path?: string;
  noindex?: boolean;
  /** URL absoluta da imagem OG. Se omitida, usa app/opengraph-image.tsx. */
  ogImage?: string;
  keywords?: string[];
  type?: "website" | "article";
};

export function getOrganizationJsonLd() {
  const siteUrl = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${siteUrl}/#organization`,
    name: SITE_NAME,
    legalName: "Altivia Tecnologia e Serviços Digitais LTDA",
    taxID: "63.101.423/0001-18",
    url: siteUrl,
    logo: `${siteUrl}/icon.svg`,
    slogan: SITE_TAGLINE,
    description: SITE_DESCRIPTION,
  };
}

/**
 * Produto pago (relatorio completo).
 *
 * O site vende um relatorio de R$ 24,90 e nao declarava nenhum dado
 * estruturado de comercio — o preco so existia no HTML, invisivel para o
 * Google.
 *
 * Sem aggregateRating e sem review: inventar nota media e o caminho mais curto
 * para uma penalidade manual, e nao ha avaliacao real coletada ainda. As seis
 * verificacoes listadas sao as de SECOES_RELATORIO, nao uma promessa de
 * marketing.
 */
export function getRelatorioProdutoJsonLd() {
  const siteUrl = getSiteUrl();

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${siteUrl}/#relatorio-completo`,
    name: "Relatório veicular completo",
    description:
      "Histórico completo do veículo pela placa: leilão e remarketing, sinistro, roubo e furto, gravame, restrições e débitos.",
    category: "Consulta veicular",
    url: `${siteUrl}/exemplo`,
    brand: { "@id": `${siteUrl}/#organization` },
    offers: {
      "@type": "Offer",
      price: PRECO_RELATORIO_REAIS.toFixed(2),
      priceCurrency: "BRL",
      availability: "https://schema.org/InStock",
      url: `${siteUrl}/#consultar`,
      seller: { "@id": `${siteUrl}/#organization` },
    },
  };
}

export function getWebSiteJsonLd() {
  const siteUrl = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteUrl}/#website`,
    name: SITE_NAME,
    url: siteUrl,
    description: SITE_DESCRIPTION,
    inLanguage: "pt-BR",
    publisher: { "@id": `${siteUrl}/#organization` },
  };
}

export function getSeoMetadata({
  title,
  description,
  path = "",
  noindex = false,
  ogImage,
  keywords,
  type = "website",
}: SeoMetadataInput): Metadata {
  const siteUrl = getSiteUrl();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  // Canonical absoluto, sem query string e sem barra final (exceto home).
  const canonical =
    normalizedPath === "/"
      ? siteUrl
      : `${siteUrl}${normalizedPath.replace(/\/$/, "")}`;

  const ogImages = ogImage
    ? [{ url: ogImage, width: 1200, height: 630, alt: title }]
    : undefined;

  return {
    title,
    description,
    keywords,
    alternates: { canonical },
    robots: noindex
      ? { index: false, follow: false }
      : { index: true, follow: true },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: SITE_NAME,
      locale: "pt_BR",
      type,
      ...(ogImages ? { images: ogImages } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
  };
}

export function getDefaultMetadata(): Metadata {
  const siteUrl = getSiteUrl();
  const base = getSeoMetadata({
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    path: "/",
  });

  return {
    ...base,
    metadataBase: new URL(siteUrl),
    // Precisa vir DEPOIS do spread: `base.title` e uma string e sobrescrevia
    // este objeto, deixando o template `%s | RevelaPlaca` sem efeito nenhum.
    title: {
      default: `${SITE_NAME} — ${SITE_TAGLINE}`,
      template: `%s | ${SITE_NAME}`,
    },
  };
}
