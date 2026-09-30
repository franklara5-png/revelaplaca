import "server-only";

import type { ConsultaPremium } from "./types";

/**
 * Relatorio pago montado na API da Consultar Placa.
 *
 * Diferente do adaptador generico (uma URL que devolve tudo), aqui cada item
 * do relatorio e um endpoint separado e COBRADO separado. Por isso:
 *
 * - os seis itens sao pedidos em paralelo;
 * - so tenta de novo o item que falhou, nunca o relatorio inteiro — repetir
 *   tudo pagaria de novo o que ja veio (o leilao sozinho custa ~R$ 13,52);
 * - nao tenta de novo depois de TIMEOUT. Nao se sabe se a consulta que estourou
 *   o tempo foi cobrada; na duvida, nao se paga duas vezes.
 *
 * O contrato com a pagina do relatorio (lib/relatorio/normalizar.ts), por item:
 *   objeto com conteudo -> registro encontrado (alerta / risco)
 *   null                -> nada consta
 *   undefined           -> indisponivel
 *
 * A traducao importa nos dois sentidos. A API responde "possui_registro":
 * "indisponivel" com HTTP 200: tratar isso como nada consta diria ao cliente
 * "Nada consta — verificado" sobre um dado que ninguem conseguiu ver. E
 * repassar a resposta crua ({ possui_registro: "nao", ... }) faria a pagina ver
 * um objeto com chaves e acusar registro onde nao ha nenhum.
 *
 * Nenhum texto aqui cita o fornecedor: tudo o que sai desta funcao vai para a
 * tela do cliente. Tambem nao passam adiante as URLs de foto do leilao, que
 * apontam para o dominio do fornecedor e carregam token de acesso.
 */

const BASE = "https://api.consultarplaca.com.br/v2";

type Chave = Exclude<keyof ConsultaPremium, "placa">;
type Secao = Record<string, string> | null | undefined;
type Dados = Record<string, unknown>;

type Definicao = {
  caminho: string;
  timeoutMs: number;
  tentativas: number;
  traduzir: (dados: Dados) => Secao;
};

// ── helpers de leitura ─────────────────────────────────────────────────────

function obj(valor: unknown): Dados | undefined {
  return valor && typeof valor === "object" && !Array.isArray(valor)
    ? (valor as Dados)
    : undefined;
}

function lista(valor: unknown): Dados[] {
  return Array.isArray(valor) ? (valor.filter(obj) as Dados[]) : [];
}

function txt(valor: unknown): string {
  return valor === null || valor === undefined ? "" : String(valor).trim();
}

/** Junta partes nao vazias com " · ". */
function linha(...partes: unknown[]): string {
  return partes.map(txt).filter(Boolean).join(" · ");
}

/** Tira campos vazios — campo vazio na tela so polui. */
function limpo(campos: Record<string, string>): Record<string, string> {
  return Object.fromEntries(Object.entries(campos).filter(([, v]) => v !== ""));
}

/**
 * "sim" -> registro, "nao" -> nada consta, qualquer outra coisa
 * ("indisponivel", campo ausente) -> indisponivel.
 */
function porFlag(flag: unknown, montar: () => Record<string, string>): Secao {
  const f = txt(flag).toLowerCase();
  if (f === "sim") return limpo(montar());
  if (f === "nao" || f === "não") return null;
  return undefined;
}

// ── traducao de cada item ──────────────────────────────────────────────────

const SECOES: Record<Chave, Definicao> = {
  leilao: {
    caminho: "consultarRegistroLeilaoPrime",
    // A documentacao recomenda ate 300s: quando HA leilao, a API processa as
    // fotos antes de responder. Fica abaixo do teto de 300s da funcao.
    timeoutMs: 240_000,
    tentativas: 1,
    traduzir(dados) {
      const leilao = obj(dados.informacoes_sobre_leilao);
      const remarketing = obj(dados.informacoes_sobre_remarketing);
      if (!leilao) return undefined;

      const temLeilao = txt(leilao.possui_registro).toLowerCase();
      const temRemarketing = txt(remarketing?.possui_registro).toLowerCase();

      if (temLeilao !== "sim" && temRemarketing !== "sim") {
        return temLeilao === "nao" || temLeilao === "não" ? null : undefined;
      }

      const oferta = obj(leilao.registro_sobre_oferta);
      const classe = txt(oferta?.classificacao);
      const dicionario = obj(oferta?.dicionario_classificacoes);
      const tituloClasse = txt(obj(dicionario?.[classe])?.titulo);

      const leiloes = lista(obj(leilao.registro_leiloes)?.registros).map((r) =>
        linha(r.data_leilao, r.comitente, r.lote && `lote ${txt(r.lote)}`),
      );

      const eventos = lista(remarketing?.registros).map((r) =>
        linha(r.data_evento, r.organizador, r.condicao_geral_veiculo),
      );

      return limpo({
        classificacao: classe ? linha(`Classe ${classe}`, tituloClasse) : "",
        leiloes: leiloes.join("\n"),
        remarketing: eventos.join("\n"),
      });
    },
  },

  sinistro: {
    caminho: "consultarSinistroComPerdaTotal",
    timeoutMs: 30_000,
    tentativas: 2,
    traduzir(dados) {
      const r = obj(dados.registro_sinistro_com_perda_total);
      return porFlag(r?.possui_registro, () => ({
        situacao: txt(r?.registro) || "Consta registro de sinistro com perda total",
      }));
    },
  },

  rouboFurto: {
    caminho: "consultarHistoricoRouboFurto",
    timeoutMs: 30_000,
    tentativas: 2,
    traduzir(dados) {
      const r = obj(obj(dados.historico_roubo_furto)?.registros_roubo_furto);
      return porFlag(r?.possui_registro, () => ({
        ocorrencias: lista(r?.registros)
          .map((o) =>
            linha(
              o.data_boletim_ocorrencia,
              o.tipo_ocorrencia,
              o.uf_ocorrencia,
              o.boletim_ocorrencia && `B.O. ${txt(o.boletim_ocorrencia)}`,
            ),
          )
          .join("\n"),
      }));
    },
  },

  gravame: {
    caminho: "consultarGravame",
    timeoutMs: 30_000,
    tentativas: 2,
    traduzir(dados) {
      const g = obj(dados.gravame);
      const registro = obj(g?.registro);
      return porFlag(g?.possui_gravame, () => ({
        situacao: txt(registro?.situacao) || "Consta gravame ativo",
        agente_financeiro: txt(obj(registro?.agente_financeiro)?.nome),
        data_do_registro: txt(registro?.data_registro),
      }));
    },
  },

  restricoes: {
    caminho: "consultarRenajud",
    timeoutMs: 30_000,
    tentativas: 2,
    traduzir(dados) {
      const b = obj(dados.registro_de_bloqueio_judicial_renajud);
      return porFlag(b?.possui_bloqueio, () => ({
        bloqueios_judiciais: lista(b?.bloqueios)
          .map((x) =>
            linha(x.tipo_restricao, x.tribunal, x.processo && `processo ${txt(x.processo)}`),
          )
          .join("\n"),
      }));
    },
  },

  debitos: {
    caminho: "consultarRegistrosInfracoesRenainf",
    timeoutMs: 30_000,
    tentativas: 2,
    traduzir(dados) {
      const i = obj(obj(dados.registro_debitos_por_infracoes_renainf)?.infracoes_renainf);
      const infracoes = lista(i?.infracoes);
      return porFlag(i?.possui_infracoes, () => ({
        total_de_infracoes: String(infracoes.length),
        infracoes: infracoes
          .map((x) => {
            const d = obj(x.dados_infracao);
            const e = obj(x.eventos);
            return linha(
              e?.data_hora_infracao,
              d?.infracao,
              d?.valor_aplicado && `R$ ${txt(d?.valor_aplicado)}`,
              d?.municipio,
            );
          })
          .join("\n"),
      }));
    },
  },
};

// ── rede ───────────────────────────────────────────────────────────────────

type Falha = "timeout" | "erro";

async function chamar(
  caminho: string,
  placa: string,
  timeoutMs: number,
  autorizacao: string,
): Promise<Dados | Falha> {
  const url = `${BASE}/${caminho}?placa=${encodeURIComponent(placa)}`;

  try {
    const res = await fetch(url, {
      headers: { Authorization: autorizacao, Accept: "application/json" },
      signal: AbortSignal.timeout(timeoutMs),
      cache: "no-store",
    });

    const corpo = (await res.json().catch(() => null)) as Dados | null;

    if (!res.ok || txt(corpo?.status).toLowerCase() !== "ok") {
      // Credito esgotado e credencial errada caem aqui. So status e mensagem
      // no log — nunca a URL com credencial nem o corpo inteiro.
      console.error(
        `[premium] ${caminho}: HTTP ${res.status} — ${txt(corpo?.mensagem) || "sem mensagem"}`,
      );
      return "erro";
    }

    return obj(corpo?.dados) ?? "erro";
  } catch (erro) {
    const nome = erro instanceof Error ? erro.name : "";
    if (nome === "TimeoutError" || nome === "AbortError") {
      console.error(`[premium] ${caminho}: sem resposta em ${timeoutMs / 1000}s`);
      return "timeout";
    }
    console.error(`[premium] ${caminho}: falha de rede`, nome);
    return "erro";
  }
}

async function buscarSecao(
  chave: Chave,
  placa: string,
  autorizacao: string,
): Promise<Secao> {
  const def = SECOES[chave];

  for (let tentativa = 1; tentativa <= def.tentativas; tentativa++) {
    const resposta = await chamar(def.caminho, placa, def.timeoutMs, autorizacao);

    if (resposta === "timeout") return undefined;
    if (resposta === "erro") {
      if (tentativa < def.tentativas) {
        await new Promise((r) => setTimeout(r, 1_500));
      }
      continue;
    }

    return def.traduzir(resposta);
  }

  return undefined;
}

/**
 * Consulta os seis itens. Devolve null so quando NENHUM veio — ai o relatorio
 * nao e gerado e o cliente recebe o aviso de "em processamento". Com ao menos
 * um item, o relatorio sai e os que faltaram aparecem como indisponiveis.
 */
export async function consultarPremiumConsultarPlaca(
  placa: string,
): Promise<ConsultaPremium | null> {
  const usuario = process.env.FORNECEDOR_PREMIUM_USUARIO;
  const token = process.env.FORNECEDOR_PREMIUM_TOKEN;

  if (!usuario || !token) {
    console.error(
      "[premium] FORNECEDOR_PREMIUM_USUARIO e FORNECEDOR_PREMIUM_TOKEN sao obrigatorios",
    );
    return null;
  }

  const autorizacao = `Basic ${Buffer.from(`${usuario}:${token}`).toString("base64")}`;
  const chaves = Object.keys(SECOES) as Chave[];

  const secoes = await Promise.all(
    chaves.map((chave) => buscarSecao(chave, placa, autorizacao)),
  );

  if (secoes.every((s) => s === undefined)) return null;

  const resultado: ConsultaPremium = { placa };
  chaves.forEach((chave, i) => {
    resultado[chave] = secoes[i];
  });
  return resultado;
}

// Exportado para teste: a traducao e a parte que decide o que o cliente le.
export const _traducoesParaTeste = Object.fromEntries(
  Object.entries(SECOES).map(([chave, def]) => [chave, def.traduzir]),
) as Record<Chave, (dados: Dados) => Secao>;
