"use client";

import Link from "next/link";
import { enviarEventoCliente } from "@/components/analytics/track-evento";

type Props = {
  placa: string;
  href: string;
  className?: string;
  children: React.ReactNode;
};

export function CtaRelatorioLink({ placa, href, className, children }: Props) {
  return (
    <Link
      href={href}
      className={className}
      onClick={() => void enviarEventoCliente("cta_relatorio_click", placa)}
    >
      {children}
    </Link>
  );
}
