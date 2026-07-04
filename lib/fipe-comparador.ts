export type FaixaComparacaoFipe =
  | "abaixo"
  | "proximo"
  | "acima"
  | "sem_fipe";

export type ResultadoComparacaoFipe = {
  faixa: FaixaComparacaoFipe;
  percentual: number | null;
  label: string;
  variant: "ok" | "warn" | "danger" | "neutral";
};

const TOLERANCIA_PROXIMO = 10;

export function compararPrecoComFipe(
  precoInformado: number,
  fipeValor: number | null | undefined,
): ResultadoComparacaoFipe {
  if (!fipeValor || fipeValor <= 0 || !Number.isFinite(precoInformado) || precoInformado <= 0) {
    return {
      faixa: "sem_fipe",
      percentual: null,
      label: "Sem referência FIPE",
      variant: "neutral",
    };
  }

  const diff = ((precoInformado - fipeValor) / fipeValor) * 100;
  const percentual = Math.round(diff);

  if (diff < -20) {
    return {
      faixa: "abaixo",
      percentual,
      label: `${Math.abs(percentual)}% abaixo da FIPE`,
      variant: "danger",
    };
  }

  if (diff < -TOLERANCIA_PROXIMO) {
    return {
      faixa: "abaixo",
      percentual,
      label: `${Math.abs(percentual)}% abaixo da FIPE`,
      variant: "warn",
    };
  }

  if (diff > TOLERANCIA_PROXIMO) {
    return {
      faixa: "acima",
      percentual,
      label: `${percentual}% acima da FIPE`,
      variant: "ok",
    };
  }

  return {
    faixa: "proximo",
    percentual,
    label: "Próximo da FIPE",
    variant: "ok",
  };
}

export function parsePrecoBrl(input: string): number | null {
  const limpo = input.replace(/[^\d,.-]/g, "").replace(/\./g, "").replace(",", ".");
  const valor = Number.parseFloat(limpo);
  return Number.isFinite(valor) && valor > 0 ? valor : null;
}

export function formatarPrecoBrl(valor: number): string {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
