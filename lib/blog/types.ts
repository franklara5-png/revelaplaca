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
  category: BlogCategory;
  tags: string[];
  readTime: string;
  featured: boolean;
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
