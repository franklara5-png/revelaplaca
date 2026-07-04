import Link from "next/link";
import { Logo } from "@/components/brand";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE } from "@/lib/site-url";

const FOOTER_LINKS = [
  { href: "/tabela-fipe", label: "Tabela FIPE" },
  { href: "/fontes", label: "Fontes de dados" },
  { href: "/contrato-compra-venda-veiculo", label: "Contrato compra e venda" },
  { href: "/blog", label: "Blog" },
  { href: "/termos", label: "Termos de uso" },
  { href: "/privacidade", label: "Privacidade" },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-rp-slate-100 bg-rp-surface px-4 py-12">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div>
            <Logo className="text-rp-primary" textClassName="text-rp-ink" />
            <p className="mt-3 text-sm font-medium text-rp-primary">{SITE_TAGLINE}</p>
            <p className="mt-2 max-w-sm text-sm text-rp-slate-600">
              {SITE_DESCRIPTION} Sem exibir dados pessoais do proprietário, em
              conformidade com a LGPD.
            </p>
          </div>
          <nav>
            <ul className="flex flex-wrap gap-x-6 gap-y-2">
              {FOOTER_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm font-medium text-rp-slate-600 hover:text-rp-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <p className="mt-8 border-t border-rp-slate-100 pt-8 text-center text-xs text-rp-slate-400">
          © {year} {SITE_NAME}. Dados de veículos obtidos de{" "}
          <Link href="/fontes" className="underline hover:text-rp-slate-600">
            fontes públicas e parceiros autorizados
          </Link>
          . Não substitui vistoria presencial. Orientação sobre golpes:{" "}
          <a
            href="https://desconfiei.com.br"
            className="underline hover:text-rp-slate-600"
          >
            Desconfiei
          </a>
          .
        </p>
      </div>
    </footer>
  );
}
