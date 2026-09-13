-- Checkpoint do import FIPE em tabela, nao mais so em arquivo local.
--
-- Motivo: o script scripts/importa-fipe.ts guardava o progresso em
-- .fipe-checkpoint.json no filesystem local. O novo cron
-- app/api/cron/importa-fipe/route.ts roda no Vercel, onde o filesystem e
-- efemero (some a cada invocacao) — precisa de um lugar persistente pra
-- lembrar quais marcas ja foram importadas por completo.
--
-- Escrito a mao em vez de `drizzle-kit generate`: o meta/_journal.json deste
-- projeto esta dessincronizado do historico real (varias migrations
-- aplicadas nao aparecem nele), entao gerar automaticamente produziu um
-- diff incorreto tentando recriar tabelas/constraints que ja existem.

CREATE TABLE IF NOT EXISTS "fipe_import_progresso" (
	"codigo_marca" text PRIMARY KEY NOT NULL,
	"nome_marca" text NOT NULL,
	"concluida_em" timestamp with time zone DEFAULT now()
);
