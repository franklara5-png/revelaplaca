export const BLOG_CATEGORIES = [
  "guias",
  "compra-venda",
  "fipe",
  "documentacao",
  "seguranca",
] as const;

export type BlogCategory = (typeof BLOG_CATEGORIES)[number];

export interface BlogFaq {
  question: string;
  answer: string;
}

export interface BlogPostMeta {
  slug: string;
  title: string;
  description: string;
  date: string;
  /**
   * Data da ultima revisao relevante do texto, quando houve.
   *
   * Separada de `date` porque o schema BlogPosting usava a MESMA data em
   * datePublished e dateModified — ou seja, o site afirmava que nenhum post
   * jamais foi tocado. Reescrever um artigo sem atualizar isto faz o Google
   * continuar tratando o conteudo como antigo.
   *
   * Vazio significa "nunca revisado", e ai dateModified volta a ser `date`.
   */
  updated?: string;
  category: BlogCategory;
  tags: string[];
  readTime: string;
  featured: boolean;
  /** Se true, o post não entra em listagens públicas nem no sitemap. */
  draft?: boolean;
  author?: string;
  canonical?: string;
  image?: string;
  faqs?: BlogFaq[];
}

export interface BlogPost extends BlogPostMeta {
  content: string;
}

export const CATEGORY_LABELS: Record<BlogCategory, string> = {
  guias: "Guias",
  "compra-venda": "Compra e venda",
  fipe: "FIPE",
  documentacao: "Documentação",
  seguranca: "Segurança",
};

export function isBlogCategory(
  value: string | null | undefined,
): value is BlogCategory {
  return BLOG_CATEGORIES.includes(value as BlogCategory);
}
