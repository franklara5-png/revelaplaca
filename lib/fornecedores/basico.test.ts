import { describe, expect, it } from "vitest";

import { extrairDeResposta, mascararChassi } from "./basico";

// Resposta real da APIBrasil (produto "agregados-propria") em modo de
// homologacao, capturada em 02/10/2026. O bloco "user" (dados da conta do
// Frank na APIBrasil) foi trocado por valores ficticios.
const respostaApiBrasil = {
  user: { first_name: "FULANO", email: "conta@exemplo.com", cellphone: "11900000000" },
  balance: "0,000",
  status_code: 200,
  error: false,
  homolog: true,
  data: {
    placa: "ABC1234",
    placaMercosul: "ABC1B34",
    chassi: "9BWZZZ377VT004251",
    fabricante: "VW",
    marca: "VW",
    marcaDetalhes: { nome: "VW", fipeId: "001267-0" },
    modelo: "GOL 1.0",
    versao: "1.0 FLEX 12V 4P",
    ano_fabricacao: 2020,
    ano_modelo: 2021,
    combustivel: "ALCOOL/GASOLINA",
    tipo_veiculo: "AUTOMOVEL",
    cor: "PRATA",
    uf_jurisdicao: "SP",
    cidade: "SAO PAULO",
    documento_faturado: "00000000000000",
  },
};

describe("consulta basica — APIBrasil", () => {
  const dados = extrairDeResposta(respostaApiBrasil, "ABC1234");

  it("le os campos que a tela mostra", () => {
    expect(dados).toMatchObject({
      marca: "VW",
      modelo: "GOL 1.0",
      versao: "1.0 FLEX 12V 4P",
      anoFabricacao: 2020,
      anoModelo: 2021,
      cor: "PRATA",
      municipio: "SAO PAULO",
      uf: "SP",
      combustivel: "ALCOOL/GASOLINA",
      segmento: "AUTOMOVEL",
      fipeCodigo: "001267-0",
    });
  });

  it("NUNCA guarda o chassi completo — vai para tela publica e para o Google", () => {
    expect(dados.chassiParcial).toBe("9BW**********4251");
    expect(JSON.stringify(dados)).not.toContain("9BWZZZ377VT004251");
  });

  it("nao carrega dado da conta nem documento do faturado", () => {
    const texto = JSON.stringify(dados);
    expect(texto).not.toContain("11900000000");
    expect(texto).not.toContain("conta@exemplo.com");
    expect(texto).not.toContain("00000000000000");
  });
});

describe("mascararChassi", () => {
  it("mantem 3 primeiros e 4 ultimos", () => {
    expect(mascararChassi("9BWZZZ377VT004251")).toBe("9BW**********4251");
  });

  it("valor ja mascarado passa direto", () => {
    expect(mascararChassi("9BW**********4251")).toBe("9BW**********4251");
  });

  it("valor curto demais nao vira chassi", () => {
    expect(mascararChassi("12345")).toBeNull();
    expect(mascararChassi(null)).toBeNull();
  });
});
