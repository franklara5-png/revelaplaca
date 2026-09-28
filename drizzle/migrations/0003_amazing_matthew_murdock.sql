ALTER TABLE "pedidos" ADD COLUMN "user_id" text;--> statement-breakpoint
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_pedidos_user" ON "pedidos" USING btree ("user_id","criado_em");--> statement-breakpoint
CREATE INDEX "idx_pedidos_email" ON "pedidos" USING btree ("email","criado_em");