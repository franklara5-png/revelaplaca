import "server-only";

import type { ConsultaPremium, FornecedorPremium } from "./types";
import { sanitizarDados } from "./sanitize";

const TIMEOUT_MS = 15_000;

function extrairSecao(
  bruto: Record<string, unknown>,
  ...chaves: string[]
): Record<string, unknown> | null {
  for (const chave of chaves) {
    const valor = bruto[chave];
    if (valor && typeof valor === "object" && !Array.isArray(valor)) {
      return sanitizarDados(valor as Record<string, unknown>);
    }
  }
  return null;
}

function extrairDeResposta(
  bruto: Record<string, unknown>,
  placa: string,
): ConsultaPremium {
  const raiz =
    (bruto.data as Record<string, unknown> | undefined) ??
    (bruto.relatorio as Record<string, unknown> | undefined) ??
    bruto;

  return {
    placa,
    leilao: extrairSecao(raiz, "leilao", "leilão", "auction"),
    sinistro: extrairSecao(raiz, "sinistro", "sinistros", "claim"),
    rouboFurto: extrairSecao(
      raiz,
      "roubo_furto",
      "rouboFurto",
      "roubo",
      "furto",
      "theft",
    ),
    gravame: extrairSecao(raiz, "gravame", "gravames", "lien"),
    restricoes: extrairSecao(
      raiz,
      "restricoes",
      "restrições",
      "restricao",
      "restrictions",
    ),
    debitos: extrairSecao(raiz, "debitos", "débitos", "debts", "multas"),
  };
}

async function chamarFornecedor(
  placa: string,
  tentativa: number,
): Promise<ConsultaPremium | null> {
  const urlBase = process.env.FORNECEDOR_PREMIUM_URL;
  const token = process.env.FORNECEDOR_PREMIUM_TOKEN;

  if (!urlBase) {
    console.error("[fornecedor-premium] FORNECEDOR_PREMIUM_URL não configurada");
    return null;
  }

  const url = urlBase.includes("{placa}")
    ? urlBase.replace("{placa}", placa)
    : `${urlBase.replace(/\/$/, "")}/${placa}`;

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(token ? { "X-Api-Key": token } : {}),
      },
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: "no-store",
    });

    if (!res.ok) {
      console.error(
        `[fornecedor-premium] HTTP ${res.status} (tentativa ${tentativa})`,
      );
      return null;
    }

    const bruto = sanitizarDados(
      (await res.json()) as Record<string, unknown>,
    );
    return extrairDeResposta(bruto, placa);
  } catch (erro) {
    console.error(`[fornecedor-premium] erro (tentativa ${tentativa}):`, erro);
    return null;
  }
}

export const fornecedorPremium: FornecedorPremium = {
  async consultar(placa: string) {
    const primeira = await chamarFornecedor(placa, 1);
    if (primeira) return primeira;
    return chamarFornecedor(placa, 2);
  },
};
