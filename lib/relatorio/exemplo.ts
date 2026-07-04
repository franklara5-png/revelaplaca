import { normalizarRelatorio } from "./normalizar";
import type { RelatorioNormalizado } from "./types";

export const PLACA_EXEMPLO = "BRA2E19";

export function dadosRelatorioExemplo(): Record<string, unknown> {
  const consultadoEm = new Date().toISOString();

  return {
    _meta: {
      fonte: "Bases ilustrativas RevelaPlaca",
      consultadoEm,
    },
    leilao: {
      tipo: "Leilão judicial",
      data: "2023-08-14",
      comitente: "Banco exemplo S.A.",
      situacao: "Arrematado",
      observacao: "Veículo recuperado de financiamento",
    },
    sinistro: null,
    rouboFurto: null,
    gravame: null,
    restricoes: null,
    debitos: null,
  };
}

export function relatorioExemploNormalizado(): RelatorioNormalizado {
  return normalizarRelatorio(PLACA_EXEMPLO, dadosRelatorioExemplo());
}
