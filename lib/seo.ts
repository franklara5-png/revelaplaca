import type { Metadata } from "next";
import {
  getSiteUrl,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TAGLINE,
} from "./site-url";

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

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: `${SITE_NAME} — ${SITE_TAGLINE}`,
      template: `%s | ${SITE_NAME}`,
    },
    description: SITE_DESCRIPTION,
    ...getSeoMetadata({
      title: `${SITE_NAME} — ${SITE_TAGLINE}`,
      description: SITE_DESCRIPTION,
      path: "/",
    }),
  };
}
