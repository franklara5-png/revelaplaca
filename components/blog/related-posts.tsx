import Link from "next/link";
import type { BlogPostMeta } from "@/lib/blog";

export function RelatedPosts({ posts }: { posts: BlogPostMeta[] }) {
  if (posts.length === 0) {
    return (
      <p className="text-sm text-rp-slate-500">Nenhum post relacionado ainda.</p>
    );
  }

  return (
    <ul className="space-y-3">
      {posts.map((post) => (
        <li key={post.slug}>
          <Link
            href={`/blog/${post.slug}`}
            className="block text-sm font-medium text-rp-slate-700 hover:text-rp-primary-900 hover:underline"
          >
            {post.title}
          </Link>
        </li>
      ))}
    </ul>
  );
}
