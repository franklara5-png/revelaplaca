import "server-only";

import { sanitizarDados } from "./sanitize";

/**
 * Camada de rede compartilhada pelos adaptadores basico e premium.
 *
 * Os dois faziam a MESMA chamada, duplicada linha a linha, e os dois eram
 * GET-only com um unico token. A maioria dos fornecedores brasileiros de dado
 * veicular usa POST com corpo JSON, e alguns exigem um segundo header alem do
 * Authorization (a apibrasil.io, por exemplo, pede `DeviceToken`). Do jeito
 * antigo, trocar de fornecedor era mexer em codigo; agora e configuracao.
 */

export type ConfigFornecedor = {
  /** "basico" | "premium" — usado no prefixo dos logs. */
  nome: string;
  urlBase: string | undefined;
  token: string | undefined;
  /** GET (padrao) ou POST. Qualquer outro valor cai para GET com aviso. */
  metodo: string | undefined;
  /** Header extra opcional, para quem exige um segundo token. */
  headerExtraNome: string | undefined;
  headerExtraValor: string | undefined;
  /** Nome do campo da placa no corpo do POST. Padrao: "placa". */
  campoPlaca: string | undefined;
  /**
   * Campos fixos a mais no corpo do POST, como JSON. A APIBrasil, por
   * exemplo, escolhe o produto pelo corpo: {"tipo":"agregados-propria"}.
   */
  corpoExtra?: string | undefined;
  timeoutMs: number;
};

function normalizarMetodo(valor: string | undefined, nome: string): "GET" | "POST" {
  const m = (valor ?? "GET").trim().toUpperCase();
  if (m === "GET" || m === "POST") return m;

  console.error(
    `[fornecedor-${nome}] metodo "${valor}" invalido. Use GET ou POST. Usando GET.`,
  );
  return "GET";
}

function lerCorpoExtra(
  bruto: string | undefined,
  nome: string,
): Record<string, unknown> {
  if (!bruto?.trim()) return {};
  try {
    const valor = JSON.parse(bruto);
    if (valor && typeof valor === "object" && !Array.isArray(valor)) {
      return valor as Record<string, unknown>;
    }
  } catch {
    // cai no aviso abaixo
  }
  console.error(
    `[fornecedor-${nome}] FORNECEDOR_${nome.toUpperCase()}_CORPO_EXTRA nao e um objeto JSON valido; ignorado`,
  );
  return {};
}

/**
 * Monta a URL. Em GET a placa vai no caminho quando nao ha `{placa}` no
 * template — comportamento antigo, mantido. Em POST ela vai no corpo, entao
 * concatenar no caminho so produziria 404.
 */
function montarUrl(urlBase: string, placa: string, metodo: "GET" | "POST"): string {
  if (urlBase.includes("{placa}")) return urlBase.replace("{placa}", placa);
  if (metodo === "POST") return urlBase;
  return `${urlBase.replace(/\/$/, "")}/${placa}`;
}

/**
 * Faz uma tentativa e devolve o JSON ja sanitizado, ou null em qualquer falha.
 * Quem chama decide se tenta de novo e como interpretar o conteudo.
 */
export async function buscarNoFornecedor(
  placa: string,
  tentativa: number,
  config: ConfigFornecedor,
): Promise<Record<string, unknown> | null> {
  const { nome, urlBase, token, headerExtraNome, headerExtraValor } = config;

  if (!urlBase) {
    console.error(
      `[fornecedor-${nome}] FORNECEDOR_${nome.toUpperCase()}_URL nao configurada`,
    );
    return null;
  }

  const metodo = normalizarMetodo(config.metodo, nome);
  const url = montarUrl(urlBase, placa, metodo);

  // Manda o token nos dois formatos mais comuns porque o fornecedor ignora o
  // que nao reconhece — evita uma variavel so para dizer qual deles usar.
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(token ? { "X-Api-Key": token } : {}),
    ...(headerExtraNome && headerExtraValor
      ? { [headerExtraNome]: headerExtraValor }
      : {}),
  };

  let body: string | undefined;
  if (metodo === "POST") {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify({
      ...lerCorpoExtra(config.corpoExtra, nome),
      [config.campoPlaca?.trim() || "placa"]: placa,
    });
  }

  try {
    const res = await fetch(url, {
      method: metodo,
      headers,
      body,
      signal: AbortSignal.timeout(config.timeoutMs),
      cache: "no-store",
    });

    if (!res.ok) {
      console.error(
        `[fornecedor-${nome}] HTTP ${res.status} em ${metodo} (tentativa ${tentativa})`,
      );
      return null;
    }

    const json = (await res.json()) as Record<string, unknown>;

    // Ha fornecedor que responde 200 com o erro no corpo (a APIBrasil manda
    // "error": true quando o saldo acaba). Tratar isso como sucesso gravaria
    // um veiculo em branco no cache.
    if (json.error === true) {
      console.error(
        `[fornecedor-${nome}] erro no corpo (tentativa ${tentativa}): ${String(json.message ?? "sem mensagem")}`,
      );
      return null;
    }

    return sanitizarDados(json);
  } catch (erro) {
    console.error(`[fornecedor-${nome}] erro (tentativa ${tentativa}):`, erro);
    return null;
  }
}
