import Link from "next/link";
import { CATEGORY_LABELS, type BlogPostMeta } from "@/lib/blog";

function formatarData(date: string) {
  return new Date(date).toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function PostHeader({ post }: { post: BlogPostMeta }) {
  return (
    <header className="mb-10 max-w-3xl">
      <Link
        href="/blog"
        className="text-sm font-semibold text-rp-primary-700 hover:underline"
      >
        ← Blog
      </Link>
      <p className="mt-4 inline-flex rounded-full bg-rp-primary-50 px-2.5 py-0.5 text-xs font-semibold text-rp-primary-800">
        {CATEGORY_LABELS[post.category]}
      </p>
      <h1 className="rp-section-heading mt-4">{post.title}</h1>
      <p className="rp-body mt-4">{post.description}</p>
      <div className="mt-4 flex flex-wrap gap-3 text-sm text-rp-slate-500">
        <time dateTime={post.date}>{formatarData(post.date)}</time>
        <span aria-hidden>·</span>
        <span>{post.readTime}</span>
        {post.author && (
          <>
            <span aria-hidden>·</span>
            <span>{post.author}</span>
          </>
        )}
      </div>
    </header>
  );
}
