ALTER TABLE "consultas" ADD COLUMN "user_id" text;--> statement-breakpoint
ALTER TABLE "consultas" ADD CONSTRAINT "consultas_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_consultas_user" ON "consultas" USING btree ("user_id","criada_em");