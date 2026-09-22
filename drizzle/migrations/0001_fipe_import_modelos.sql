CREATE TABLE "fipe_import_modelos" (
	"codigo_marca" text NOT NULL,
	"codigo_modelo" text NOT NULL,
	"concluido_em" timestamp with time zone DEFAULT now(),
	CONSTRAINT "fipe_import_modelos_pkey" PRIMARY KEY("codigo_marca","codigo_modelo")
);
