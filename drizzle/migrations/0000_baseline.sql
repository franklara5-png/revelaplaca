CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp with time zone,
	"refresh_token_expires_at" timestamp with time zone,
	"scope" text,
	"password" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "admin_login_tentativas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ip_hash" text NOT NULL,
	"criada_em" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "admin_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"acao" text NOT NULL,
	"alvo" text NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "consultas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"placa" text NOT NULL,
	"ip_hash" text NOT NULL,
	"origem" text,
	"cache_hit" boolean DEFAULT false,
	"criada_em" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "creditos" (
	"email" text PRIMARY KEY NOT NULL,
	"saldo" integer DEFAULT 0 NOT NULL,
	"atualizado_em" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "eventos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome" text NOT NULL,
	"placa" text,
	"meta" jsonb,
	"criado_em" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "eventos_api_rate" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ip_hash" text NOT NULL,
	"criada_em" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "fipe_import_progresso" (
	"codigo_marca" text PRIMARY KEY NOT NULL,
	"nome_marca" text NOT NULL,
	"concluida_em" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "fipe_modelos" (
	"codigo" text NOT NULL,
	"marca" text NOT NULL,
	"modelo" text NOT NULL,
	"ano" integer NOT NULL,
	"combustivel" text DEFAULT '' NOT NULL,
	"valor" numeric,
	"referencia" text,
	"slug_marca" text NOT NULL,
	"slug_modelo" text NOT NULL,
	CONSTRAINT "fipe_modelos_pkey" PRIMARY KEY("codigo","ano","combustivel")
);
--> statement-breakpoint
CREATE TABLE "pedidos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"placa" text NOT NULL,
	"email" text NOT NULL,
	"produto" text DEFAULT 'relatorio_completo' NOT NULL,
	"valor_centavos" integer NOT NULL,
	"asaas_customer_id" text,
	"asaas_payment_id" text,
	"status" text DEFAULT 'pendente' NOT NULL,
	"email_recuperacao_enviado" boolean DEFAULT false NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now(),
	"pago_em" timestamp with time zone,
	CONSTRAINT "pedidos_asaas_payment_id_unique" UNIQUE("asaas_payment_id")
);
--> statement-breakpoint
CREATE TABLE "relatorios" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pedido_id" uuid,
	"placa" text NOT NULL,
	"dados" jsonb NOT NULL,
	"token_acesso" text NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now(),
	"expira_em" timestamp with time zone,
	CONSTRAINT "relatorios_pedido_id_unique" UNIQUE("pedido_id"),
	CONSTRAINT "relatorios_token_acesso_unique" UNIQUE("token_acesso")
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"token" text NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "site_visits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ip_hash" text,
	"path" text,
	"referrer" text,
	"user_agent" text,
	"country" text,
	"region" text,
	"city" text,
	"visited_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "veiculos" (
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
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "relatorios" ADD CONSTRAINT "relatorios_pedido_id_pedidos_id_fk" FOREIGN KEY ("pedido_id") REFERENCES "public"."pedidos"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_admin_login_ip" ON "admin_login_tentativas" USING btree ("ip_hash","criada_em");--> statement-breakpoint
CREATE INDEX "idx_admin_logs_criado" ON "admin_logs" USING btree ("criado_em");--> statement-breakpoint
CREATE INDEX "idx_consultas_ip" ON "consultas" USING btree ("ip_hash","criada_em");--> statement-breakpoint
CREATE INDEX "idx_eventos_nome_criado" ON "eventos" USING btree ("nome","criado_em");--> statement-breakpoint
CREATE INDEX "idx_eventos_api_rate_ip" ON "eventos_api_rate" USING btree ("ip_hash","criada_em");--> statement-breakpoint
CREATE INDEX "idx_fipe_marca" ON "fipe_modelos" USING btree ("slug_marca");--> statement-breakpoint
CREATE INDEX "idx_fipe_modelo" ON "fipe_modelos" USING btree ("slug_marca","slug_modelo");--> statement-breakpoint
CREATE INDEX "idx_site_visits_visited_at" ON "site_visits" USING btree ("visited_at");--> statement-breakpoint
CREATE INDEX "idx_site_visits_ip_hash" ON "site_visits" USING btree ("ip_hash");