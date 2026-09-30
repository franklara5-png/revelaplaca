import { describe, expect, it } from "vitest";

import { _traducoesParaTeste as t } from "./consultarplaca";
import { normalizarRelatorio } from "@/lib/relatorio/normalizar";

// Payloads copiados dos exemplos da documentacao da API (docs.consultarplaca
// .com.br), campo `dados` de cada resposta. A traducao decide o que o cliente
// le sobre o carro: "Nada consta", "Atencao" ou "Indisponivel".

const sinistro = (flag: string, registro = "") => ({
  registro_sinistro_com_perda_total: { possui_registro: flag, registro },
});

const roubo = (flag: string, registros: unknown[] = []) => ({
  historico_roubo_furto: { registros_roubo_furto: { possui_registro: flag, registros } },
});

describe("traducao: sim / nao / indisponivel", () => {
  it("sinistro com registro vira objeto com a situacao", () => {
    expect(t.sinistro(sinistro("sim", "CONSTA INDENIZAÇÃO INTEGRAL"))).toEqual({
      situacao: "CONSTA INDENIZAÇÃO INTEGRAL",
    });
  });

  it("sinistro sem registro vira null (nada consta)", () => {
    expect(t.sinistro(sinistro("nao"))).toBeNull();
  });

  it('"indisponivel" NAO vira nada consta — vira undefined', () => {
    // O erro que este teste impede: mostrar "Nada consta — verificado" sobre
    // um dado que o fornecedor nao conseguiu consultar.
    expect(t.sinistro(sinistro("indisponivel"))).toBeUndefined();
    expect(t.rouboFurto(roubo("indisponivel"))).toBeUndefined();
  });

  it("resposta sem o bloco esperado vira indisponivel, nao nada consta", () => {
    expect(t.sinistro({})).toBeUndefined();
    expect(t.gravame({})).toBeUndefined();
    expect(t.leilao({})).toBeUndefined();
  });

  it("roubo/furto com registro lista as ocorrencias em texto", () => {
    const r = t.rouboFurto(
      roubo("sim", [
        {
          boletim_ocorrencia: "9996",
          data_boletim_ocorrencia: "02/09/2019",
          tipo_ocorrencia: "Declaração de Roubo",
          uf_ocorrencia: "PR",
        },
      ]),
    );
    expect(r).toEqual({
      ocorrencias: "02/09/2019 · Declaração de Roubo · PR · B.O. 9996",
    });
  });

  it("gravame ativo traz situacao, banco e data", () => {
    expect(
      t.gravame({
        gravame: {
          possui_gravame: "sim",
          registro: {
            agente_financeiro: { cnpj: "90400888000142", nome: "BANCO SANTANDER SA" },
            data_registro: "07/07/2022",
            situacao: "CONSTA REGISTRO DE GRAVAME",
          },
        },
      }),
    ).toEqual({
      situacao: "CONSTA REGISTRO DE GRAVAME",
      agente_financeiro: "BANCO SANTANDER SA",
      data_do_registro: "07/07/2022",
    });
  });

  it("gravame inexistente e nada consta", () => {
    expect(t.gravame({ gravame: { possui_gravame: "nao", registro: null } })).toBeNull();
  });

  it("bloqueio judicial (RENAJUD)", () => {
    expect(
      t.restricoes({
        registro_de_bloqueio_judicial_renajud: {
          possui_bloqueio: "sim",
          bloqueios: [
            { tribunal: "TJDF", processo: "12345678910111213", tipo_restricao: "04-PENHORA" },
          ],
        },
      }),
    ).toEqual({ bloqueios_judiciais: "04-PENHORA · TJDF · processo 12345678910111213" });
  });

  it("infracoes (RENAINF) trazem o total e uma linha por infracao", () => {
    const r = t.debitos({
      registro_debitos_por_infracoes_renainf: {
        infracoes_renainf: {
          possui_infracoes: "sim",
          infracoes: [
            {
              dados_infracao: {
                infracao: "7455 - TRANSITAR EM ATE 20% ACIMA DA VELOCIDADE PERMITIDA",
                valor_aplicado: "130,16",
                municipio: "DOURADOS",
              },
              eventos: { data_hora_infracao: "08/02/2019" },
            },
          ],
        },
      },
    });
    expect(r).toEqual({
      total_de_infracoes: "1",
      infracoes:
        "08/02/2019 · 7455 - TRANSITAR EM ATE 20% ACIMA DA VELOCIDADE PERMITIDA · R$ 130,16 · DOURADOS",
    });
  });
});

describe("leilao", () => {
  const comLeilao = {
    informacoes_sobre_leilao: {
      possui_registro: "sim",
      registro_sobre_oferta: {
        classificacao: "C",
        dicionario_classificacoes: {
          C: { titulo: "(Seguradoras / Detrans / Ciretrans / Receita federal)" },
        },
      },
      registro_leiloes: {
        registros: [{ comitente: "HDI SEGUROS", lote: "148", data_leilao: "09/11/2021" }],
      },
    },
    informacoes_sobre_remarketing: {
      possui_registro: "sim",
      registros: [{ organizador: "NomeOrganizador", data_evento: "16/11/2016" }],
      fotos: ["https://api.consultarplaca.com.br/images/remarketing?token=EXEMPLO"],
    },
    informacoes_possiveis_danos_detectados_por_ia: {
      imagens: ["https://api.consultarplaca.com.br/images/leilaoPrimeIA?token=x"],
    },
  };

  it("com registro traz classe, leiloes e remarketing", () => {
    expect(t.leilao(comLeilao)).toEqual({
      classificacao: "Classe C · (Seguradoras / Detrans / Ciretrans / Receita federal)",
      leiloes: "09/11/2021 · HDI SEGUROS · lote 148",
      remarketing: "16/11/2016 · NomeOrganizador",
    });
  });

  it("nunca repassa URL do fornecedor (fotos com token e dominio dele)", () => {
    expect(JSON.stringify(t.leilao(comLeilao))).not.toMatch(/consultarplaca|token=/i);
  });

  it("sem leilao e sem remarketing e nada consta", () => {
    expect(
      t.leilao({
        informacoes_sobre_leilao: { possui_registro: "nao" },
        informacoes_sobre_remarketing: { possui_registro: "nao" },
      }),
    ).toBeNull();
  });
});

describe("ponta a ponta com a pagina do relatorio", () => {
  // Monta o relatorio do mesmo jeito que lib/relatorios.ts grava e passa pelo
  // normalizador que a tela usa. E aqui que se ve o que o cliente leria.
  function relatorioDe(secoes: Record<string, unknown>) {
    const chaves = ["leilao", "sinistro", "rouboFurto", "gravame", "restricoes", "debitos"];
    const dados = JSON.parse(JSON.stringify(secoes));
    dados._meta = { indisponivel: chaves.filter((k) => secoes[k] === undefined) };
    return normalizarRelatorio("AAA0000", dados);
  }

  it('"nao" aparece como Nada consta, "indisponivel" como Indisponivel, "sim" como alerta', () => {
    const r = relatorioDe({
      leilao: t.leilao({ informacoes_sobre_leilao: { possui_registro: "nao" } }),
      sinistro: t.sinistro(sinistro("indisponivel")),
      rouboFurto: t.rouboFurto(roubo("nao")),
      gravame: t.gravame({
        gravame: { possui_gravame: "sim", registro: { situacao: "CONSTA REGISTRO DE GRAVAME" } },
      }),
      restricoes: t.restricoes({
        registro_de_bloqueio_judicial_renajud: { possui_bloqueio: "nao", bloqueios: [] },
      }),
      debitos: undefined,
    });

    const status = Object.fromEntries(r.secoes.map((s) => [s.chave, s.status]));
    expect(status).toEqual({
      leilao: "ok",
      sinistro: "desconhecido",
      rouboFurto: "ok",
      gravame: "alerta",
      restricoes: "ok",
      debitos: "desconhecido",
    });
  });
});
