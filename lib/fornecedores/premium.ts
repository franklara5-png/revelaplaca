import "server-only";

import type { ConsultaPremium, FornecedorPremium } from "./types";
import { sanitizarDados } from "./sanitize";
import { buscarNoFornecedor } from "./http";
import { consultarPremiumConsultarPlaca } from "./consultarplaca";

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
  const bruto = await buscarNoFornecedor(placa, tentativa, {
    nome: "premium",
    urlBase: process.env.FORNECEDOR_PREMIUM_URL,
    token: process.env.FORNECEDOR_PREMIUM_TOKEN,
    metodo: process.env.FORNECEDOR_PREMIUM_METODO,
    headerExtraNome: process.env.FORNECEDOR_PREMIUM_HEADER_NOME,
    headerExtraValor: process.env.FORNECEDOR_PREMIUM_HEADER_VALOR,
    campoPlaca: process.env.FORNECEDOR_PREMIUM_CAMPO_PLACA,
    timeoutMs: TIMEOUT_MS,
  });

  if (!bruto) return null;
  return extrairDeResposta(bruto, placa);
}

// Qual adaptador usar. Variavel INTERNA, nunca exibida.
//
// Nao confundir com FORNECEDOR_PREMIUM_NOME: aquela vai para a TELA do
// cliente ("Nada consta — verificado em <nome>", em
// components/relatorio/secao-relatorio.tsx) e nao deve conter o nome do
// fornecedor. Sem ela, o relatorio mostra "Parceiro veicular autorizado".
//
//   (vazio)         -> adaptador generico: uma URL que devolve tudo
//   consultarplaca  -> um endpoint por item, cobrado por item
const TIPO = process.env.FORNECEDOR_PREMIUM_TIPO?.trim().toLowerCase();

export const fornecedorPremium: FornecedorPremium = {
  async consultar(placa: string) {
    if (TIPO === "consultarplaca") {
      return consultarPremiumConsultarPlaca(placa);
    }

    const primeira = await chamarFornecedor(placa, 1);
    if (primeira) return primeira;
    return chamarFornecedor(placa, 2);
  },
};
