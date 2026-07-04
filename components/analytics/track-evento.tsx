"use client";

import { track } from "@vercel/analytics";
import type { NomeEventoCliente } from "@/lib/eventos-constants";

type Meta = {
  percentual?: number;
};

export async function enviarEventoCliente(
  nome: NomeEventoCliente,
  placa?: string,
  meta?: Meta,
): Promise<void> {
  track(nome, { placa, ...meta });

  try {
    await fetch("/api/eventos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, placa, meta }),
    });
  } catch {
    /* silencioso */
  }
}
