-- Um pedido gera no maximo UM relatorio.
--
-- Motivo: a Asaas reenvia webhook por desenho. Sem esta constraint, duas
-- entregas simultaneas do mesmo evento geravam dois relatorios para o mesmo
-- pedido, dois e-mails para o cliente e DUAS chamadas pagas ao fornecedor
-- premium por uma unica venda.
--
-- A trava principal e de aplicacao (UPDATE condicional em
-- processarPagamentoConfirmado). Esta constraint e a garantia de ultima
-- instancia, para o caso de a logica falhar ou de alguem chamar a geracao por
-- outro caminho no futuro.
--
-- Seguro de rodar: relatorios tem 0 linhas e 0 pedidos duplicados na data
-- desta migration (verificado).

ALTER TABLE "relatorios"
  ADD CONSTRAINT "relatorios_pedido_id_unique" UNIQUE ("pedido_id");
