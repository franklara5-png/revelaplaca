import Link from "next/link";

type Props = {
  title: string;
  children: React.ReactNode;
};

export function LegalLayout({ title, children }: Props) {
  return (
    <div className="px-4 pb-20 pt-28">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/"
          className="text-sm font-semibold text-rp-primary-700 hover:underline"
        >
          ← Início
        </Link>
        <h1 className="rp-section-heading mt-6">{title}</h1>
        <div className="prose-rp mt-8">{children}</div>
      </div>
    </div>
  );
}
