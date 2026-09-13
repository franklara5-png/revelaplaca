-- site_visits: tracking geral de visitas para alimentar o dashboard interno
-- (Hermes, GET /api/hermes/stats). Tabela nova e separada do antifraude —
-- consultas/admin_login_tentativas/eventos_api_rate usam ip_hash e não são
-- tocadas aqui. Cada visita é 1 INSERT (sem upsert); a agregação "1 IP = 1
-- linha" acontece só na leitura, agrupando por ip.
--
-- Sem colunas de pagamento/cartão (resíduo de outro fluxo em outro site, não
-- se aplica aqui) e sem cron de retenção/expiração (decisão futura do Frank).

CREATE TABLE IF NOT EXISTS "site_visits" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "ip" text,
  "path" text,
  "referrer" text,
  "user_agent" text,
  "country" text,
  "region" text,
  "city" text,
  "visited_at" timestamp with time zone DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "idx_site_visits_visited_at" ON "site_visits" ("visited_at");
CREATE INDEX IF NOT EXISTS "idx_site_visits_ip" ON "site_visits" ("ip");
