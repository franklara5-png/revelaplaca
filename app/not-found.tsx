import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui";
import { getSeoMetadata } from "@/lib/seo";

export const metadata: Metadata = getSeoMetadata({
  title: "Página não encontrada",
  description: "A página que você procura não existe ou saiu do ar.",
  path: "/404",
  noindex: true,
});

const ATALHOS = [
  {
    href: "/consulta-veicular-gratis",
    titulo: "Consulta veicular grátis",
    texto: "Marca, modelo, ano, cor e valor FIPE pela placa, sem pagar nada.",
  },
  {
    href: "/tabela-fipe",
    titulo: "Tabela FIPE",
    texto: "Preços de referência por marca, modelo, ano e combustível.",
  },
  {
    href: "/guia-compra-carro-usado",
    titulo: "Guia de compra de carro usado",
    texto: "Checklist do que conferir antes de fechar negócio.",
  },
  {
    href: "/blog",
    titulo: "Blog",
    texto: "Leilão, IPVA, transferência e golpes na compra de usados.",
  },
];

export default function NotFound() {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-20 pt-32">
      <p className="text-sm font-semibold text-rp-primary">Erro 404</p>
      <h1 className="mt-2 text-3xl font-bold text-rp-ink">
        Essa página não existe
      </h1>
      <p className="mt-4 text-sm leading-relaxed text-rp-slate-600 md:text-base">
        O endereço pode ter mudado, ou o link que te trouxe até aqui está
        quebrado. Nada se perdeu — é só seguir por um dos caminhos abaixo.
      </p>

      <Button asChild className="mt-8" size="lg">
        <Link href="/#consultar">Revelar uma placa</Link>
      </Button>

      <ul className="mt-12 grid gap-3 sm:grid-cols-2">
        {ATALHOS.map((atalho) => (
          <li key={atalho.href}>
            <Link
              href={atalho.href}
              className="rp-card block h-full p-4 transition-shadow hover:shadow-[var(--rp-shadow-card-hover)]"
            >
              <span className="font-semibold text-rp-slate-900">
                {atalho.titulo}
              </span>
              <span className="mt-1 block text-sm text-rp-slate-500">
                {atalho.texto}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
