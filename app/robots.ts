import type { MetadataRoute } from "next";
import { PRODUCTION_SITE_URL } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/admin",
          "/admin/",
          "/checkout/",
          "/relatorio/",
          "/painel",
          "/painel/",
          "/login",
        ],
      },
    ],
    // Sempre apex de produção — não depende de env de preview.
    sitemap: `${PRODUCTION_SITE_URL}/sitemap.xml`,
  };
}
