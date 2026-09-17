import { describe, expect, it } from "vitest";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { newDb } from "pg-mem";
import { getDb } from "@/db";
import {
  CARENCIA_PAGOS_SEM_RELATORIO_MIN,
  contarPagosSemRelatorio,
  queryPagosSemRelatorio,
} from "@/lib/admin/stats";

// `neon()`/`drizzle()` são preguiçosos: construir o db e o query builder NÃO
// abre conexão. `.toSQL()` também é puro — só serializa a query. Então esta
// URL placeholder nunca é usada de verdade; serve só para materializar o
// builder tipado sem tocar no Neon de produção.
const dbSemRede = drizzle(
  neon("postgres://user:***@localhost:5432/nao-usada"),
);

describe("queryPagosSemRelatorio — SQL gerado", () => {
  it("junta pedidos ao relatório por LEFT JOIN e filtra pago sem relatório", () => {
    const { sql: sqlGerado, params } = queryPagosSemRelatorio(dbSemRede).toSQL();

    // Discriminação: pedido LIGADO ao relatorio (LEFT JOIN por pedido_id)...
    expect(sqlGerado).toMatch(/left join\s+"relatorios"/i);
    expect(sqlGerado).toContain('"relatorios"."id" is null');

    // ...e só conta os pagos (status = 'pago', via parâmetro).
    expect(sqlGerado.toLowerCase()).toContain("count(*)");
    expect(params).toContain("pago");
  });

  it("manda a carencia como PARAMETRO, nunca dentro de string literal", () => {
    const { sql: sqlGerado, params } = queryPagosSemRelatorio(dbSemRede).toSQL();

    // Este teste existe por causa de um bug real (17/09/2026): a versão
    // anterior interpolava o número DENTRO de aspas simples, num
    // "interval '<N> minutes'". O valor vira parâmetro, e o Postgres não
    // substitui parâmetro dentro de string literal — ele lê o dígito do
    // índice do parâmetro. Verificado no Neon: aquilo era aceito sem erro
    // nenhum e valia 2 minutos em vez de 15, e passaria a valer 3 se a ordem
    // dos parâmetros mudasse. Conferir só o texto do SQL não pega isso, então
    // o que este teste exige é o número estar entre os params.
    expect(sqlGerado).not.toMatch(/interval\s+'\$\d/);
    expect(params).toContain(CARENCIA_PAGOS_SEM_RELATORIO_MIN);
  });
});

describe("contarPagosSemRelatorio — contrato do resultado", () => {
  it("devolve o total do banco quando há pedidos pagos sem relatório", async () => {
    const fake = fakeDbQueDevolve([{ total: 2 }]);
    await expect(contarPagosSemRelatorio(fake)).resolves.toBe(2);
  });

  it("devolve 0 quando o banco retorna vazio (nenhum pago sem relatório)", async () => {
    const fake = fakeDbQueDevolve([]);
    await expect(contarPagosSemRelatorio(fake)).resolves.toBe(0);
  });
});

describe("contarPagosSemRelatorio — carência (integração pg-mem)", () => {
  // Prova a SEMÂNTICA temporal da carência contra `now()`.
  //
  // O pg-mem não suporta a sintaxe paramétrica que a produção usa
  // (`$2 * interval '1 minute'` — ela quebra no pg-mem por ele tipar parâmetro
  // como texto; em Postgres real funciona). Por isso este teste executa a
  // query com a forma literal equivalente `interval '<N> minutes'`, que é
  // SEMANTICAMENTE idêntica. A sintaxe exata de produção já é coberta pelo
  // teste de `.toSQL()` acima. O que se prova aqui é a REGRA: pago agora não
  // conta, pago além da carência conta.
  function dbDeTeste() {
    const mem = newDb();
    const { Pool } = mem.adapters.createPg();
    const pool = new Pool();

    async function executar(text: string, values: unknown[] = []) {
      const r = (await pool.query({ text, values })) as { rows: unknown[] };
      return r.rows;
    }

    async function preparar() {
      await executar(
        `create table pedidos (id uuid primary key, status text not null, pago_em timestamptz)`,
      );
      await executar(
        `create table relatorios (id uuid primary key, pedido_id uuid)`,
      );
    }

    // Espelha queryPagosSemRelatorio, com a carência em forma literal (o
    // pg-mem só aceita `interval 'N minutes'`, não `N * interval`).
    async function contar() {
      const rows = await executar(
        `select count(*)::int as total from "pedidos" left join "relatorios" on "relatorios"."pedido_id" = "pedidos"."id" where ("pedidos"."status" = $1 and "relatorios"."id" is null and "pedidos"."pago_em" is not null and "pedidos"."pago_em" <= now() - interval '${CARENCIA_PAGOS_SEM_RELATORIO_MIN} minutes')`,
        ["pago"],
      );
      return (rows[0] as { total: number }).total;
    }

    return { executar, preparar, contar };
  }

  it("pedido pago AGORA sem relatório NÃO conta (carência)", async () => {
    const t = dbDeTeste();
    await t.preparar();
    await t.executar(
      `insert into pedidos (id, status, pago_em) values ('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', 'pago', now())`,
    );

    await expect(t.contar()).resolves.toBe(0);
  });

  it("o mesmo pedido com pagoEm além da carência conta", async () => {
    const t = dbDeTeste();
    await t.preparar();
    await t.executar(
      `insert into pedidos (id, status, pago_em) values ('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', 'pago', now() - interval '30 minutes')`,
    );

    await expect(t.contar()).resolves.toBe(1);
  });

  it("pedido pago além da carência COM relatório NÃO conta", async () => {
    const t = dbDeTeste();
    await t.preparar();
    await t.executar(
      `insert into pedidos (id, status, pago_em) values ('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', 'pago', now() - interval '30 minutes')`,
    );
    await t.executar(
      `insert into relatorios (id, pedido_id) values ('bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb', 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa')`,
    );

    await expect(t.contar()).resolves.toBe(0);
  });
});

/**
 * Fake mínimo do db que implementa apenas a cadeia usada por
 * `contarPagosSemRelatorio` — `.select().from().leftJoin().where()` — e devolve
 * o array programado quando a query é aguardada. Existe só para o teste de
 * contrato de retorno; a semântica da discriminação fica coberta pelo teste
 * de `.toSQL()` acima.
 */
function fakeDbQueDevolve(linhas: Array<{ total: number }>) {
  const builder = {
    select: () => builder,
    from: () => builder,
    leftJoin: () => builder,
    where: () => builder,
    then: (resolve: (v: Array<{ total: number }>) => void) => resolve(linhas),
  };

  return builder as unknown as ReturnType<typeof getDb>;
}
