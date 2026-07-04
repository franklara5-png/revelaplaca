import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getSiteUrl } from "@/lib/site-url";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

type Props = {
  items: BreadcrumbItem[];
};

export function FipeBreadcrumb({ items }: Props) {
  const siteUrl = getSiteUrl();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      ...(item.href ? { item: `${siteUrl}${item.href}` } : {}),
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex flex-wrap items-center gap-1 text-sm text-rp-slate-600">
          {items.map((item, index) => (
            <li key={`${item.label}-${index}`} className="flex items-center gap-1">
              {index > 0 && (
                <ChevronRight className="h-3.5 w-3.5 shrink-0 text-rp-slate-400" />
              )}
              {item.href ? (
                <Link
                  href={item.href}
                  className="font-medium hover:text-rp-primary-900 hover:underline"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="font-semibold text-rp-slate-900">{item.label}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
