import Link from "next/link";
import { CATEGORY_LABELS, type BlogPostMeta } from "@/lib/blog";

function formatarData(date: string) {
  return new Date(date).toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function PostCard({ post }: { post: BlogPostMeta }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="rp-card group flex h-full flex-col p-5 transition-shadow hover:shadow-[var(--rp-shadow-card-hover)]"
    >
      <span className="inline-flex w-fit rounded-full bg-rp-primary-50 px-2.5 py-0.5 text-xs font-semibold text-rp-primary-800">
        {CATEGORY_LABELS[post.category]}
      </span>

      <h2 className="mt-3 text-lg font-bold text-rp-slate-900 transition group-hover:text-rp-primary-900">
        {post.title}
      </h2>

      <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-rp-slate-600">
        {post.description}
      </p>

      <div className="mt-4 flex items-center gap-3 text-xs text-rp-slate-400">
        <span>{post.readTime}</span>
        <span aria-hidden>·</span>
        <time dateTime={post.date}>{formatarData(post.date)}</time>
      </div>
    </Link>
  );
}
