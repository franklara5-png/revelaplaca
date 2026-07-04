import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import {
  getAllPostSlugs,
  getPostBySlug,
  getRelatedPosts,
} from "@/lib/blog";
import { PostHeader, RelatedPosts } from "@/components/blog";
import { Card, Button } from "@/components/ui";
import { getSeoMetadata } from "@/lib/seo";
import { getSiteUrl, SITE_NAME } from "@/lib/site-url";

export const revalidate = 3600;

export async function generateStaticParams() {
  return getAllPostSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    return getSeoMetadata({
      title: "Post não encontrado",
      description: "Artigo não encontrado.",
      path: `/blog/${slug}`,
      noindex: true,
    });
  }

  return getSeoMetadata({
    title: post.title,
    description: post.description,
    path: `/blog/${slug}`,
    ogImage: post.image,
  });
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const siteUrl = getSiteUrl();
  const postUrl = `${siteUrl}/blog/${slug}`;
  const related = getRelatedPosts(slug, post.category);

  const jsonLdGraph = [
    {
      "@type": "Article",
      headline: post.title,
      description: post.description,
      datePublished: post.date,
      author: {
        "@type": "Organization",
        name: post.author ?? SITE_NAME,
        url: siteUrl,
      },
      publisher: {
        "@type": "Organization",
        name: SITE_NAME,
        url: siteUrl,
      },
      mainEntityOfPage: { "@type": "WebPage", "@id": postUrl },
      ...(post.image ? { image: post.image } : {}),
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Início", item: siteUrl },
        {
          "@type": "ListItem",
          position: 2,
          name: "Blog",
          item: `${siteUrl}/blog`,
        },
        { "@type": "ListItem", position: 3, name: post.title, item: postUrl },
      ],
    },
    ...(post.faqs && post.faqs.length > 0
      ? [
          {
            "@type": "FAQPage",
            mainEntity: post.faqs.map((faq) => ({
              "@type": "Question",
              name: faq.question,
              acceptedAnswer: { "@type": "Answer", text: faq.answer },
            })),
          },
        ]
      : []),
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": jsonLdGraph,
          }),
        }}
      />

      <div className="px-4 pb-20 pt-28">
        <div className="mx-auto max-w-6xl lg:grid lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-12">
          <article className="min-w-0">
            <PostHeader post={post} />
            <div className="prose-rp">
              <MDXRemote source={post.content} />
            </div>
          </article>

          <aside className="mt-10 space-y-6 lg:mt-0">
            <Card className="bg-rp-primary-50 border-rp-primary-100">
              <h2 className="font-bold text-rp-primary-900">Revelar placa</h2>
              <p className="mt-2 text-sm text-rp-slate-600">
                Veja dados básicos grátis ou adquira o relatório completo no RevelaPlaca.
              </p>
              <Button asChild className="mt-4 w-full">
                <Link href="/">Revelar agora</Link>
              </Button>
            </Card>

            <Card>
              <h2 className="font-bold text-rp-slate-900">Posts relacionados</h2>
              <div className="mt-4">
                <RelatedPosts posts={related} />
              </div>
            </Card>
          </aside>
        </div>
      </div>
    </>
  );
}
