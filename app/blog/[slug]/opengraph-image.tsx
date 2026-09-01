import { ImageResponse } from "next/og";
import { getAllPostSlugs, getPostBySlug } from "@/lib/blog";
import { SITE_NAME } from "@/lib/site-url";

export const alt = "Artigo do blog RevelaPlaca";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return getAllPostSlugs().map((slug) => ({ slug }));
}

export default async function BlogOpenGraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  const title = post?.title ?? "Blog RevelaPlaca";

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #0D545D 0%, #05282E 100%)",
          color: "white",
          padding: 64,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {/* Marca "metade revelada" — mesma geometria de components/brand/Logo.tsx */}
          <svg width="62" height="32" viewBox="3 17 58 30" fill="none">
            <path
              d="M32 22h20.5a4.5 4.5 0 0 1 4.5 4.5v11a4.5 4.5 0 0 1-4.5 4.5H32z"
              fill="white"
            />
            <rect
              x="5"
              y="20"
              width="54"
              height="24"
              rx="6"
              stroke="white"
              strokeWidth="4"
            />
            <rect x="13" y="29" width="13" height="4" rx="2" fill="white" />
            <rect x="13" y="36" width="9" height="4" rx="2" fill="white" />
          </svg>
          <span style={{ fontSize: 28, fontWeight: 700 }}>{SITE_NAME}</span>
          <span style={{ fontSize: 24, opacity: 0.6, marginLeft: 8 }}>
            Blog
          </span>
        </div>

        <div
          style={{
            fontSize: title.length > 60 ? 42 : 52,
            fontWeight: 800,
            lineHeight: 1.15,
            maxWidth: 1000,
          }}
        >
          {title}
        </div>

        <div style={{ fontSize: 22, opacity: 0.7 }}>revelaplaca.com.br</div>
      </div>
    ),
    { ...size },
  );
}
