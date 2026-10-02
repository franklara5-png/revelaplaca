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

/**
 * Interruptor das vendas. Exige a chave do Asaas E `VENDAS_ATIVAS=true`.
 *
 * Antes bastava a chave existir. O problema: variavel nova na Vercel so vale
 * no proximo deploy, entao gravar a chave "para depois" deixava as vendas
 * prontas para ligar sozinhas no proximo deploy qualquer — inclusive um de
 * correcao sem relacao nenhuma. E vender sem credito nos fornecedores e o
 * cliente pagar e receber "relatorio em processamento".
 *
 * Ligar: `VENDAS_ATIVAS=true` na Vercel e deploy. Desligar (credito acabou,
 * fornecedor fora do ar): apagar a variavel e deploy — o resto do site segue.
 */
export function vendasAtivas(): boolean {
  const chave = process.env.ASAAS_API_KEY ?? "";
  const interruptor = process.env.VENDAS_ATIVAS;
  const ativas = chave.length > 0 && interruptor === "true";

  if (!ativas) {
    // Diz POR QUE o checkout recusou — sem isso, "pagamentos indisponiveis"
    // nao distingue chave ausente de interruptor desligado. So presenca e
    // tamanho; o valor da chave nunca vai para o log.
    console.warn("[vendas] checkout fechado", {
      chaveAsaas: chave.length > 0 ? `presente (${chave.length} chars)` : "AUSENTE",
      interruptor: interruptor === undefined ? "AUSENTE" : JSON.stringify(interruptor),
    });
  }

  return ativas;
}

export type StatusPedido =
  | "pendente"
  | "pago"
  | "expirado"
  | "estornado";

export type MetodoPagamento = "PIX" | "CREDIT_CARD";
