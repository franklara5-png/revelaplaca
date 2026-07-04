import Link from "next/link";
import { getAllPosts, getPostsByCategory, isBlogCategory } from "@/lib/blog";
import { PostCard } from "@/components/blog";
import { getSeoMetadata } from "@/lib/seo";
import { Button } from "@/components/ui";

export const revalidate = 3600;

export const metadata = getSeoMetadata({
  title: "Blog — consulta veicular e compra de usados",
  description:
    "Guias sobre consulta de placa, Tabela FIPE, documentação veicular e segurança na compra de carros usados.",
  path: "/blog",
  keywords: ["consulta placa", "carro usado", "tabela fipe", "documentação veicular"],
});

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const posts = isBlogCategory(category)
    ? getPostsByCategory(category)
    : getAllPosts();

  return (
    <div className="px-4 pb-20 pt-28">
      <div className="mx-auto max-w-6xl">
        <header className="max-w-2xl">
          <p className="rp-section-eyebrow">Blog</p>
          <h1 className="rp-section-heading mt-2">
            Consulta veicular e compra de usados
          </h1>
          <p className="rp-body mt-4">
            Guias práticos sobre placa, FIPE, documentação e o que verificar antes
            de fechar negócio.
          </p>
        </header>

        {posts.length === 0 ? (
          <p className="mt-12 text-center text-rp-slate-600">
            Nenhum post publicado ainda.
          </p>
        ) : (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        )}

        <div className="mt-16 rounded-[var(--rp-radius)] bg-rp-primary-900 px-6 py-8 text-center text-white">
          <h2 className="text-xl font-bold">Revele uma placa agora</h2>
          <p className="mt-2 text-sm text-rp-primary-100">
            Grátis — marca, modelo, ano e valor FIPE em segundos.
          </p>
          <Button asChild className="mt-6 bg-white text-rp-primary-900 hover:bg-rp-primary-50">
            <Link href="/">Revelar placa</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
