-- Fase 1: schema inicial RevelaPlaca

CREATE TABLE IF NOT EXISTS "veiculos" (
  "placa" text PRIMARY KEY NOT NULL,
  "marca" text,
  "modelo" text,
  "versao" text,
  "ano_fabricacao" integer,
  "ano_modelo" integer,
  "cor" text,
  "municipio" text,
  "uf" text,
  "combustivel" text,
  "segmento" text,
  "chassi_parcial" text,
  "fipe_codigo" text,
  "fipe_valor" numeric,
  "fipe_referencia" text,
  "dados_brutos" jsonb,
  "consultado_em" timestamp with time zone DEFAULT now(),
  "expira_em" timestamp with time zone
);

CREATE TABLE IF NOT EXISTS "consultas" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "placa" text NOT NULL,
  "ip_hash" text NOT NULL,
  "origem" text,
  "cache_hit" boolean DEFAULT false,
  "criada_em" timestamp with time zone DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "idx_consultas_ip" ON "consultas" ("ip_hash", "criada_em");

CREATE TABLE IF NOT EXISTS "pedidos" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "placa" text NOT NULL,
  "email" text NOT NULL,
  "produto" text DEFAULT 'relatorio_completo' NOT NULL,
  "valor_centavos" integer NOT NULL,
  "asaas_customer_id" text,
  "asaas_payment_id" text UNIQUE,
  "status" text DEFAULT 'pendente' NOT NULL,
  "criado_em" timestamp with time zone DEFAULT now(),
  "pago_em" timestamp with time zone
);

CREATE TABLE IF NOT EXISTS "relatorios" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "pedido_id" uuid REFERENCES "pedidos"("id"),
  "placa" text NOT NULL,
  "dados" jsonb NOT NULL,
  "token_acesso" text NOT NULL UNIQUE,
  "criado_em" timestamp with time zone DEFAULT now(),
  "expira_em" timestamp with time zone
);

CREATE TABLE IF NOT EXISTS "creditos" (
  "email" text PRIMARY KEY NOT NULL,
  "saldo" integer DEFAULT 0 NOT NULL,
  "atualizado_em" timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "fipe_modelos" (
  "codigo" text PRIMARY KEY NOT NULL,
  "marca" text NOT NULL,
  "modelo" text NOT NULL,
  "ano" integer NOT NULL,
  "combustivel" text,
  "valor" numeric,
  "referencia" text,
  "slug_marca" text NOT NULL,
  "slug_modelo" text NOT NULL
);

CREATE INDEX IF NOT EXISTS "idx_fipe_marca" ON "fipe_modelos" ("slug_marca");
CREATE INDEX IF NOT EXISTS "idx_fipe_modelo" ON "fipe_modelos" ("slug_marca", "slug_modelo");
