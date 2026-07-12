import type { Metadata } from "next";
import { getSiteUrl, SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE } from "./site-url";

export type SeoMetadataInput = {
  title: string;
  description: string;
  path?: string;
  noindex?: boolean;
  ogImage?: string;
  keywords?: string[];
};

export function getOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    legalName: "Altivia Tecnologia e Serviços Digitais LTDA",
    taxID: "63.101.423/0001-18",
    url: getSiteUrl(),
    slogan: SITE_TAGLINE,
    description: SITE_DESCRIPTION,
  };
}

export function getSeoMetadata({
  title,
  description,
  path = "",
  noindex = false,
  ogImage,
  keywords,
}: SeoMetadataInput): Metadata {
  const siteUrl = getSiteUrl();
  const canonical = `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
  const image = ogImage ?? `${siteUrl}/icon.svg`;

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
      type: "website",
      images: [{ url: image, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
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
