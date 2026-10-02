import { afterEach, describe, expect, it } from "vitest";

import { chaveAsaas } from "./asaas";

// O Next.js expande "$nome" em variavel de ambiente: "$aact_prod_..." chegava
// VAZIA no site (02/10). A chave fica gravada sem o "$" e chaveAsaas() o
// devolve. Qualquer forma de gravar precisa resultar na mesma chave.
const CHAVE = "$aact_prod_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OjExYTh";

describe("chaveAsaas", () => {
  const original = process.env.ASAAS_API_KEY;
  afterEach(() => {
    process.env.ASAAS_API_KEY = original;
  });

  it("gravada sem o $ (o jeito que vai na Vercel) recupera o $", () => {
    process.env.ASAAS_API_KEY = CHAVE.slice(1);
    expect(chaveAsaas()).toBe(CHAVE);
  });

  it("gravada com o $ (.env local) passa igual", () => {
    process.env.ASAAS_API_KEY = CHAVE;
    expect(chaveAsaas()).toBe(CHAVE);
  });

  it("gravada com \\$ escapado tambem resulta na mesma chave", () => {
    process.env.ASAAS_API_KEY = `\\${CHAVE}`;
    expect(chaveAsaas()).toBe(CHAVE);
  });

  it("ausente ou vazia continua vazia — o checkout fica fechado", () => {
    process.env.ASAAS_API_KEY = "";
    expect(chaveAsaas()).toBe("");
    delete process.env.ASAAS_API_KEY;
    expect(chaveAsaas()).toBe("");
  });
});
