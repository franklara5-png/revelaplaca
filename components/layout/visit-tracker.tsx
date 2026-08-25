"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { isBotUserAgent, isRotaPublica } from "@/lib/track/filtro";

/**
 * Dispara um POST silencioso para /api/track/visit a cada navegação, para
 * alimentar o /api/hermes/stats consumido pelo dashboard interno.
 * Só rastreia rotas públicas e ignora User-Agents de bot — a rota também
 * revalida os dois (defesa em profundidade).
 */
export function VisitTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || !isRotaPublica(pathname)) return;
    if (isBotUserAgent(navigator.userAgent)) return;

    fetch("/api/track/visit", {
      method: "POST",
      keepalive: true,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path: pathname,
        referrer: document.referrer || undefined,
      }),
    }).catch(() => {
      // Falha silenciosa: tracking nunca pode quebrar a navegação do usuário.
    });
  }, [pathname]);

  return null;
}
