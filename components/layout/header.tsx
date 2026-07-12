"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/brand";
import { UserMenu } from "@/components/UserMenu";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui";

const NAV_LINKS = [
  { href: "/#como-funciona", label: "Como funciona" },
  { href: "/#relatorio", label: "Relatório" },
  { href: "/tabela-fipe", label: "Tabela FIPE" },
  { href: "/blog", label: "Blog" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 16);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4">
      <div
        className={cn(
          "mx-auto flex max-w-4xl items-center justify-between rounded-full border px-4 py-2.5 transition-all duration-300",
          scrolled
            ? "border-rp-slate-100 bg-white/95 shadow-[var(--rp-shadow-card)] backdrop-blur-md"
            : "border-white/20 bg-white/80 shadow-sm backdrop-blur-sm",
        )}
      >
        <Link href="/" className="text-rp-primary">
          <Logo textClassName="text-rp-ink" />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-3 py-1.5 text-sm font-medium text-rp-slate-600 transition-colors hover:bg-rp-primary-50 hover:text-rp-primary"
            >
              {link.label}
            </Link>
          ))}
          <Button asChild size="sm" className="ml-2">
            <Link href="/#consultar">Revelar placa</Link>
          </Button>
          <UserMenu />
        </nav>

        <button
          type="button"
          className="rounded-full p-2 text-rp-ink md:hidden"
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          onClick={() => setOpen(!open)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <>
          <nav className="mx-auto mt-2 max-w-4xl rounded-[var(--rp-radius)] border border-rp-slate-100 bg-white p-4 shadow-[var(--rp-shadow-card)] md:hidden">
            <ul className="space-y-1">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="block rounded-xl px-3 py-2.5 text-sm font-medium text-rp-ink hover:bg-rp-slate-50"
                    onClick={() => setOpen(false)}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li className="pt-2">
                <Button asChild className="w-full">
                  <Link href="/#consultar" onClick={() => setOpen(false)}>
                    Revelar placa
                  </Link>
                </Button>
              </li>
            </ul>
          </nav>
          <button
            type="button"
            className="fixed inset-0 z-[-1] bg-black/20 md:hidden"
            aria-label="Fechar menu"
            onClick={() => setOpen(false)}
          />
        </>
      )}
    </header>
  );
}
