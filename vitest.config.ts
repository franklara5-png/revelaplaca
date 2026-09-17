import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "node",
    include: ["**/*.test.ts"],
    // `server-only` lança erro quando importado fora de Server Component do
    // Next. Nos testes (ambiente node) ele é neutralizado: os módulos sob
    // teste só têm lógica de servidor, então o guard não importa aqui.
    alias: {
      "server-only": path.resolve(__dirname, "test/setup/server-only-stub.ts"),
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
