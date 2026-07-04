export const PRECO_RELATORIO_CENTAVOS = 2490;
export const PRECO_RELATORIO_REAIS = PRECO_RELATORIO_CENTAVOS / 100;

export const PRODUTO_RELATORIO = "relatorio_completo";

export type StatusPedido =
  | "pendente"
  | "pago"
  | "expirado"
  | "estornado";

export type MetodoPagamento = "PIX" | "CREDIT_CARD";
