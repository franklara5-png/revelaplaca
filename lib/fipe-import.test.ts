import { describe, expect, it } from "vitest";

import { ordenarPorProcura } from "./fipe-import";

// Nomes como a API v1 da parallelum devolve em /marcas.
const marca = (nome: string) => ({ codigo: nome, nome });

describe("ordenarPorProcura", () => {
  it("poe as marcas populares na frente, na ordem de procura", () => {
    const fila = ordenarPorProcura(
      ["Agrale", "Ford", "GM - Chevrolet", "Lifan", "VW - VolksWagen", "Fiat"].map(marca),
    );
    expect(fila.map((m) => m.nome)).toEqual([
      "Fiat",
      "VW - VolksWagen",
      "GM - Chevrolet",
      "Ford",
      "Agrale",
      "Lifan",
    ]);
  });

  it("reconhece nome com acento e barra", () => {
    const fila = ordenarPorProcura(
      ["Lada", "CAOA Chery/Chery", "Citroën"].map(marca),
    );
    expect(fila.map((m) => m.nome)).toEqual(["Citroën", "CAOA Chery/Chery", "Lada"]);
  });
});
