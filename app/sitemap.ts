import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";
import { listarMarcas, listarModelosPorMarca, listarPlacasCacheadas } from "@/lib/fipe";
import { listarPostsBlog } from "@/lib/blog";

// Sem isto o sitemap e gerado uma vez no build e congela: as URLs de FIPE e de
// placa vem do banco, entao novas linhas so apareceriam no proximo deploy.
export const revalidate = 3600;

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

  // O indice do blog muda quando sai post novo, entao o lastmod dele e a data
  // do post mais recente. Antes caia no fallback `new Date()` e dizia "mudei
  // agora" a cada revalidacao.
  const maisRecente = posts
    .map((p) => new Date(p.updated ?? p.date))
    .filter((d) => !Number.isNaN(d.getTime()))
    .sort((a, b) => b.getTime() - a.getTime())[0];

  urls.push({
    loc: "/blog",
    lastModified: maisRecente,
    priority: 0.7,
    changeFrequency: "weekly",
  });

  for (const post of posts) {
    // lastModified do sitemap segue a revisao, nao a publicacao: e o sinal que
    // diz ao crawler que vale revisitar.
    const referencia = post.updated ?? post.date;
    const lastModified = referencia ? new Date(referencia) : undefined;
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

  // Sem `?? new Date()`. Esse fallback carimbava a hora do build em toda URL
  // que nao tinha data propria — e como este sitemap revalida a cada hora, as
  // paginas estaticas juravam ter mudado a cada revalidacao. O Google trata
  // lastmod assim como ruido e passa a ignorar o campo no sitemap INTEIRO,
  // inclusive nos posts, que tem data de verdade. Omitir e honesto: lastmod e
  // opcional, mentir nao e.
  return todas.map((item) => ({
    url: `${siteUrl}${item.loc}`,
    ...(item.lastModified ? { lastModified: item.lastModified } : {}),
    changeFrequency: item.changeFrequency ?? "weekly",
    priority: item.priority ?? 0.5,
  }));
}
