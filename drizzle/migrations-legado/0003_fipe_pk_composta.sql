-- fipe_modelos: PK de `codigo` para (codigo, ano, combustivel).
--
-- Motivo: o código FIPE identifica o MODELO, não a combinação ano+combustível.
-- Ex.: "001267-0" (Palio 1.0 ECONOMY) cobre 2009, 2010, 2011, 2012, 2013 e 2014.
-- Com PK só em `codigo`, o ON CONFLICT DO UPDATE do importador fazia cada ano
-- sobrescrever o anterior — sobrava 1 linha por modelo em vez de ~8.
--
-- Seguro de rodar: a tabela está vazia (0 linhas) na data desta migration.

ALTER TABLE "fipe_modelos" DROP CONSTRAINT IF EXISTS "fipe_modelos_pkey";
--> statement-breakpoint
UPDATE "fipe_modelos" SET "combustivel" = '' WHERE "combustivel" IS NULL;
--> statement-breakpoint
ALTER TABLE "fipe_modelos" ALTER COLUMN "combustivel" SET DEFAULT '';
--> statement-breakpoint
ALTER TABLE "fipe_modelos" ALTER COLUMN "combustivel" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "fipe_modelos"
  ADD CONSTRAINT "fipe_modelos_pkey" PRIMARY KEY ("codigo", "ano", "combustivel");
