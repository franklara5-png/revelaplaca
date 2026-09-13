# Migrations antigas (histórico, sem função)

Estes arquivos (`0000_init.sql` a `0006_fipe_import_progresso.sql`) foram os
SQLs reais aplicados no banco entre 04/jul e 13/set/2026, mas o
`meta/_journal.json` que deveria rastreá-los nunca acompanhou — metade foi
escrita à mão e aplicada via `npm run db:push` ou direto no banco, sem passar
pelo `drizzle-kit generate`. O journal chegou a apontar pra um arquivo
(`0001_sturdy_silver_samurai.sql`) que nunca existiu no repo.

Resultado: `drizzle-kit migrate` ficava quebrado (procurava um arquivo
inexistente) e `drizzle-kit generate` gerava diffs errados, tentando
recriar tabelas e constraints que já existiam em produção.

Em 13/set/2026 o histórico foi rebaselinado: o schema real (já validado
contra o Postgres de produção) virou `drizzle/migrations/0000_baseline.sql`,
e uma linha foi inserida manualmente em `drizzle.__drizzle_migrations`
marcando essa baseline como já aplicada — sem rodar o SQL de novo, só
sincronizando o registro com a realidade.

Esta pasta fica só como leitura — não é lida por `drizzle-kit` nem pelo
script de import. Não precisa mexer aqui.
