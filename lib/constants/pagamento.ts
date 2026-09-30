// Preco do relatorio completo.
//
// 30/09/2026: subiu de R$ 24,90 para R$ 49,90. O relatorio promete leilao,
// sinistro, roubo/furto, gravame, restricoes e debitos, e montar isso no
// fornecedor custa ~R$ 34,64 por relatorio (Consultar Placa, faixa de ate
// 1.000/mes). A R$ 24,90 cada venda dava prejuizo antes mesmo da taxa do
// Asaas. O mercado cobra de R$ 39,90 a R$ 59,90 pelo mesmo relatorio.
export const PRECO_RELATORIO_CENTAVOS = 4990;
export const PRECO_RELATORIO_REAIS = PRECO_RELATORIO_CENTAVOS / 100;

// Texto pronto para a tela ("R$ 49,90"). Toda pagina e componente que
// mostra o preco usa isto — antes o valor estava escrito a mao em 25 lugares
// e mudar o preco era caçar cada um.
export const PRECO_RELATORIO_TEXTO = PRECO_RELATORIO_REAIS.toLocaleString(
  "pt-BR",
  { style: "currency", currency: "BRL" },
);

export const PRODUTO_RELATORIO = "relatorio_completo";

export type StatusPedido =
  | "pendente"
  | "pago"
  | "expirado"
  | "estornado";

export type MetodoPagamento = "PIX" | "CREDIT_CARD";
