export const EVENTOS_SERVIDOR = [
  "consulta_gratis",
  "pix_gerado",
  "pagamento_confirmado",
  "contrato_gerado",
] as const;

export const EVENTOS_CLIENTE = [
  "cta_relatorio_click",
  "checkout_view",
  "cartao_click",
  "comparou_fipe",
] as const;

export const EVENTOS_FUNIL = [
  "consulta_gratis",
  "cta_relatorio_click",
  "checkout_view",
  "pix_gerado",
  "cartao_click",
  "pagamento_confirmado",
] as const;

export type NomeEventoServidor = (typeof EVENTOS_SERVIDOR)[number];
export type NomeEventoCliente = (typeof EVENTOS_CLIENTE)[number];
export type NomeEvento = NomeEventoServidor | NomeEventoCliente;

export type MetaEvento = {
  cacheHit?: boolean;
  origem?: string;
  percentual?: number;
};

const CHAVES_META_PERMITIDAS = new Set(["cacheHit", "origem", "percentual"]);

export function sanitizarMeta(meta: unknown): MetaEvento | undefined {
  if (!meta || typeof meta !== "object" || Array.isArray(meta)) return undefined;

  const limpo: MetaEvento = {};
  for (const [chave, valor] of Object.entries(meta as Record<string, unknown>)) {
    if (!CHAVES_META_PERMITIDAS.has(chave)) continue;
    if (chave === "cacheHit" && typeof valor === "boolean") {
      limpo.cacheHit = valor;
    }
    if (chave === "origem" && typeof valor === "string" && valor.length <= 64) {
      limpo.origem = valor;
    }
    if (chave === "percentual" && typeof valor === "number" && Number.isFinite(valor)) {
      limpo.percentual = Math.round(valor);
    }
  }

  return Object.keys(limpo).length > 0 ? limpo : undefined;
}

export function eventoClientePermitido(nome: string): nome is NomeEventoCliente {
  return (EVENTOS_CLIENTE as readonly string[]).includes(nome);
}
