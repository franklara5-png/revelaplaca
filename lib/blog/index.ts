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
  const filePath = path.join(POSTS_DIR, filename);
  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);
  const mtime = fs.statSync(filePath).mtime;

  const dateFromFrontmatter =
    typeof data.date === "string" && data.date.trim()
      ? String(data.date).trim()
      : "";

  return {
    slug,
    title: String(data.title ?? ""),
    description: String(data.description ?? ""),
    date: dateFromFrontmatter || mtime.toISOString().slice(0, 10),
    category: data.category as BlogCategory,
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    readTime: String(data.readTime ?? ""),
    featured: Boolean(data.featured),
    draft: Boolean(data.draft),
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

function isPublished(post: BlogPostMeta): boolean {
  return !post.draft;
}

export function getAllPosts(): BlogPostMeta[] {
  return listPostFiles()
    .map((file) => {
      const post = parsePostFile(file);
      const { content: _, ...meta } = post;
      return meta;
    })
    .filter(isPublished)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getPostBySlug(slug: string): BlogPost | null {
  const filename = `${slug}.mdx`;
  if (!listPostFiles().includes(filename)) return null;
  const post = parsePostFile(filename);
  if (post.draft) return null;
  return post;
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

/** Compatível com sitemap (async) — exclui drafts. */
export async function listarPostsBlog(): Promise<
  Array<{ slug: string; date: string }>
> {
  return getAllPosts().map((post) => ({ slug: post.slug, date: post.date }));
}
