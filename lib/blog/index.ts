import "server-only";

import fs from "fs";
import path from "path";
import matter from "gray-matter";
import type { BlogPost, BlogPostMeta, BlogCategory } from "./types";

export type { BlogPost, BlogPostMeta, BlogCategory, BlogFaq } from "./types";
export {
  BLOG_CATEGORIES,
  CATEGORY_LABELS,
  isBlogCategory,
} from "./types";

const POSTS_DIR = path.join(process.cwd(), "content", "blog");

function parseFaqs(data: Record<string, unknown>): BlogPost["faqs"] {
  if (!Array.isArray(data.faqs)) return undefined;
  return data.faqs
    .filter((item) => item && typeof item === "object")
    .map((item) => {
      const faq = item as Record<string, unknown>;
      return {
        question: String(faq.question ?? ""),
        answer: String(faq.answer ?? ""),
      };
    })
    .filter((faq) => faq.question && faq.answer);
}

function parsePostFile(filename: string): BlogPost {
  const slug = filename.replace(/\.mdx$/, "");
  const raw = fs.readFileSync(path.join(POSTS_DIR, filename), "utf8");
  const { data, content } = matter(raw);

  return {
    slug,
    title: String(data.title ?? ""),
    description: String(data.description ?? ""),
    date: String(data.date ?? ""),
    category: data.category as BlogCategory,
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    readTime: String(data.readTime ?? ""),
    featured: Boolean(data.featured),
    author: data.author ? String(data.author) : undefined,
    canonical: data.canonical ? String(data.canonical) : undefined,
    image: data.image ? String(data.image) : undefined,
    faqs: parseFaqs(data),
    content,
  };
}

function listPostFiles(): string[] {
  if (!fs.existsSync(POSTS_DIR)) return [];
  return fs.readdirSync(POSTS_DIR).filter((file) => file.endsWith(".mdx"));
}

export function getAllPosts(): BlogPostMeta[] {
  return listPostFiles()
    .map((file) => {
      const post = parsePostFile(file);
      const { content: _, ...meta } = post;
      return meta;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getPostBySlug(slug: string): BlogPost | null {
  const filename = `${slug}.mdx`;
  if (!listPostFiles().includes(filename)) return null;
  return parsePostFile(filename);
}

export function getPostsByCategory(category: BlogCategory): BlogPostMeta[] {
  return getAllPosts().filter((post) => post.category === category);
}

export function getRelatedPosts(
  slug: string,
  category: BlogCategory,
  limit = 3,
): BlogPostMeta[] {
  return getAllPosts()
    .filter((p) => p.slug !== slug && p.category === category)
    .slice(0, limit);
}

export function getAllPostSlugs(): string[] {
  return getAllPosts().map((post) => post.slug);
}

/** Compatível com sitemap (async) */
export async function listarPostsBlog(): Promise<Array<{ slug: string }>> {
  return getAllPostSlugs().map((slug) => ({ slug }));
}
