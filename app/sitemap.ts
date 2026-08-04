import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";
import { listarMarcas, listarModelosPorMarca, listarPlacasCacheadas } from "@/lib/fipe";
import { listarPostsBlog } from "@/lib/blog";

type SitemapItem = {
  loc: string;
  lastModified?: Date;
  priority?: number;
  changeFrequency?: MetadataRoute.Sitemap[0]["changeFrequency"];
};

async function montarTodasUrls(): Promise<SitemapItem[]> {
  const urls: SitemapItem[] = [];

  // Rotas estáticas indexáveis
  urls.push({ loc: "/", priority: 1, changeFrequency: "daily" });
  urls.push({ loc: "/exemplo", priority: 0.85, changeFrequency: "monthly" });
  urls.push({ loc: "/fontes", priority: 0.75, changeFrequency: "monthly" });
  urls.push({ loc: "/sobre", priority: 0.7, changeFrequency: "monthly" });
  urls.push({
    loc: "/consulta-veicular-gratis",
    priority: 0.9,
    changeFrequency: "monthly",
  });
  urls.push({
    loc: "/guia-compra-carro-usado",
    priority: 0.85,
    changeFrequency: "monthly",
  });
  urls.push({
    loc: "/contrato-compra-venda-veiculo",
    priority: 0.8,
    changeFrequency: "monthly",
  });
  urls.push({ loc: "/tabela-fipe", priority: 0.9, changeFrequency: "weekly" });
  urls.push({ loc: "/blog", priority: 0.7, changeFrequency: "weekly" });

  const marcas = await listarMarcas();
  for (const marca of marcas) {
    urls.push({
      loc: `/tabela-fipe/${marca.slugMarca}`,
      priority: 0.75,
      changeFrequency: "weekly",
    });

    const modelos = await listarModelosPorMarca(marca.slugMarca);
    for (const modelo of modelos) {
      urls.push({
        loc: `/tabela-fipe/${marca.slugMarca}/${modelo.slugModelo}`,
        priority: 0.7,
        changeFrequency: "weekly",
      });
    }
  }

  let offset = 0;
  const batch = 500;
  while (true) {
    const placas = await listarPlacasCacheadas(offset, batch);
    if (placas.length === 0) break;
    for (const v of placas) {
      urls.push({
        loc: `/consulta/${v.placa}`,
        lastModified: v.consultadoEm ?? undefined,
        priority: 0.8,
        changeFrequency: "monthly",
      });
    }
    offset += batch;
  }

  // Posts MDX publicados (drafts já filtrados em listarPostsBlog)
  const posts = await listarPostsBlog();
  for (const post of posts) {
    const lastModified = post.date ? new Date(post.date) : undefined;
    urls.push({
      loc: `/blog/${post.slug}`,
      lastModified:
        lastModified && !Number.isNaN(lastModified.getTime())
          ? lastModified
          : undefined,
      priority: 0.65,
      changeFrequency: "monthly",
    });
  }

  return urls;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const todas = await montarTodasUrls();

  return todas.map((item) => ({
    url: `${siteUrl}${item.loc}`,
    lastModified: item.lastModified ?? new Date(),
    changeFrequency: item.changeFrequency ?? "weekly",
    priority: item.priority ?? 0.5,
  }));
}
