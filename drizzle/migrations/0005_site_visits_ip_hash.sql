-- site_visits: o IP passa a ser gravado como HASH, nunca em claro.
--
-- Motivo: a rota /api/track/visit gravava o endereco completo, sem hash, junto
-- de cidade, user-agent, path e referrer. Isso identifica individuo — e
-- contradizia a propria politica de privacidade do site, que promete
-- "metricas agregadas via Vercel Analytics".
--
-- O resto do projeto ja hasheia IP (consultas.ip_hash, lib/ip-hash.ts). Esta
-- rota era a unica fora do padrao.
--
-- Os valores existentes sao ZERADOS, nao convertidos: sao IPs em claro de
-- pessoas reais e o objetivo e justamente deixar de guardar isso. As visitas
-- (path, data, cidade) permanecem; so a identificacao do visitante sai.

ALTER TABLE "site_visits" RENAME COLUMN "ip" TO "ip_hash";
--> statement-breakpoint
UPDATE "site_visits" SET "ip_hash" = NULL WHERE "ip_hash" IS NOT NULL;
--> statement-breakpoint
DROP INDEX IF EXISTS "idx_site_visits_ip";
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_site_visits_ip_hash" ON "site_visits" ("ip_hash");
