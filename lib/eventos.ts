import "server-only";

import { getDb } from "@/db";
import { eventos } from "@/db/schema";
import {
  sanitizarMeta,
  type MetaEvento,
  type NomeEvento,
} from "@/lib/eventos-constants";
import { normalizarPlaca, validarPlaca } from "@/lib/placa";

type Input = {
  placa?: string;
  meta?: MetaEvento | Record<string, unknown>;
};

export async function registrarEvento(nome: NomeEvento, input: Input = {}): Promise<void> {
  try {
    const placa =
      input.placa && validarPlaca(normalizarPlaca(input.placa))
        ? normalizarPlaca(input.placa)
        : undefined;

    const meta = sanitizarMeta(input.meta);

    await getDb().insert(eventos).values({
      nome,
      placa,
      meta: meta ?? null,
    });
  } catch (erro) {
    console.error("[eventos] falha ao registrar:", nome, erro);
  }
}
