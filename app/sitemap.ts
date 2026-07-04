import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";
import { listarMarcas, listarModelosPorMarca, listarPlacasCacheadas } from "@/lib/fipe";
import { listarPostsBlog } from "@/lib/blog";

const MAX_URLS_POR_SITEMAP = 40_000;

async function montarTodasUrls(): Promise<
  Array<{ loc: string; lastModified?: Date; priority?: number; changeFrequency?: MetadataRoute.Sitemap[0]["changeFrequency"] }>
> {
  const urls: Array<{
    loc: string;
    lastModified?: Date;
    priority?: number;
    changeFrequency?: MetadataRoute.Sitemap[0]["changeFrequency"];
  }> = [];

  urls.push({ loc: "/", priority: 1, changeFrequency: "daily" });
  urls.push({ loc: "/exemplo", priority: 0.85, changeFrequency: "monthly" });
  urls.push({ loc: "/fontes", priority: 0.75, changeFrequency: "monthly" });
  urls.push({
    loc: "/contrato-compra-venda-veiculo",
    priority: 0.8,
    changeFrequency: "monthly",
  });
  urls.push({ loc: "/tabela-fipe", priority: 0.9, changeFrequency: "weekly" });

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

  const posts = await listarPostsBlog();
  if (posts.length > 0) {
    urls.push({ loc: "/blog", priority: 0.6, changeFrequency: "weekly" });
    for (const post of posts) {
      urls.push({
        loc: `/blog/${post.slug}`,
        priority: 0.6,
        changeFrequency: "monthly",
      });
    }
  }

  return urls;
}

export async function generateSitemaps() {
  const todas = await montarTodasUrls();
  const chunks = Math.max(1, Math.ceil(todas.length / MAX_URLS_POR_SITEMAP));
  return Array.from({ length: chunks }, (_, id) => ({ id }));
}

export default async function sitemap(props: {
  id: Promise<string>;
}): Promise<MetadataRoute.Sitemap> {
  const id = Number(await props.id);
  const siteUrl = getSiteUrl();
  const todas = await montarTodasUrls();
  const slice = todas.slice(
    id * MAX_URLS_POR_SITEMAP,
    (id + 1) * MAX_URLS_POR_SITEMAP,
  );

  return slice.map((item) => ({
    url: `${siteUrl}${item.loc}`,
    lastModified: item.lastModified ?? new Date(),
    changeFrequency: item.changeFrequency ?? "weekly",
    priority: item.priority ?? 0.5,
  }));
}
