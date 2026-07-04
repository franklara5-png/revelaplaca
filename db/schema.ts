import {
  pgTable,
  text,
  integer,
  numeric,
  boolean,
  timestamp,
  uuid,
  jsonb,
  index,
} from "drizzle-orm/pg-core";

export const veiculos = pgTable("veiculos", {
  placa: text("placa").primaryKey(),
  marca: text("marca"),
  modelo: text("modelo"),
  versao: text("versao"),
  anoFabricacao: integer("ano_fabricacao"),
  anoModelo: integer("ano_modelo"),
  cor: text("cor"),
  municipio: text("municipio"),
  uf: text("uf"),
  combustivel: text("combustivel"),
  segmento: text("segmento"),
  chassiParcial: text("chassi_parcial"),
  fipeCodigo: text("fipe_codigo"),
  fipeValor: numeric("fipe_valor"),
  fipeReferencia: text("fipe_referencia"),
  dadosBrutos: jsonb("dados_brutos"),
  consultadoEm: timestamp("consultado_em", { withTimezone: true }).defaultNow(),
  expiraEm: timestamp("expira_em", { withTimezone: true }),
});

export const consultas = pgTable(
  "consultas",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    placa: text("placa").notNull(),
    ipHash: text("ip_hash").notNull(),
    origem: text("origem"),
    cacheHit: boolean("cache_hit").default(false),
    criadaEm: timestamp("criada_em", { withTimezone: true }).defaultNow(),
  },
  (table) => [index("idx_consultas_ip").on(table.ipHash, table.criadaEm)],
);

export const pedidos = pgTable("pedidos", {
  id: uuid("id").primaryKey().defaultRandom(),
  placa: text("placa").notNull(),
  email: text("email").notNull(),
  produto: text("produto").notNull().default("relatorio_completo"),
  valorCentavos: integer("valor_centavos").notNull(),
  asaasCustomerId: text("asaas_customer_id"),
  asaasPaymentId: text("asaas_payment_id").unique(),
  status: text("status").notNull().default("pendente"),
  emailRecuperacaoEnviado: boolean("email_recuperacao_enviado")
    .notNull()
    .default(false),
  criadoEm: timestamp("criado_em", { withTimezone: true }).defaultNow(),
  pagoEm: timestamp("pago_em", { withTimezone: true }),
});

export const adminLoginTentativas = pgTable(
  "admin_login_tentativas",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ipHash: text("ip_hash").notNull(),
    criadaEm: timestamp("criada_em", { withTimezone: true }).defaultNow(),
  },
  (table) => [index("idx_admin_login_ip").on(table.ipHash, table.criadaEm)],
);

export const adminLogs = pgTable(
  "admin_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    acao: text("acao").notNull(),
    alvo: text("alvo").notNull(),
    criadoEm: timestamp("criado_em", { withTimezone: true }).defaultNow(),
  },
  (table) => [index("idx_admin_logs_criado").on(table.criadoEm)],
);

export const relatorios = pgTable("relatorios", {
  id: uuid("id").primaryKey().defaultRandom(),
  pedidoId: uuid("pedido_id").references(() => pedidos.id),
  placa: text("placa").notNull(),
  dados: jsonb("dados").notNull(),
  tokenAcesso: text("token_acesso").notNull().unique(),
  criadoEm: timestamp("criado_em", { withTimezone: true }).defaultNow(),
  expiraEm: timestamp("expira_em", { withTimezone: true }),
});

export const eventos = pgTable(
  "eventos",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    nome: text("nome").notNull(),
    placa: text("placa"),
    meta: jsonb("meta"),
    criadoEm: timestamp("criado_em", { withTimezone: true }).defaultNow(),
  },
  (table) => [index("idx_eventos_nome_criado").on(table.nome, table.criadoEm)],
);

export const eventosApiRate = pgTable(
  "eventos_api_rate",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ipHash: text("ip_hash").notNull(),
    criadaEm: timestamp("criada_em", { withTimezone: true }).defaultNow(),
  },
  (table) => [index("idx_eventos_api_rate_ip").on(table.ipHash, table.criadaEm)],
);

export const creditos = pgTable("creditos", {
  email: text("email").primaryKey(),
  saldo: integer("saldo").notNull().default(0),
  atualizadoEm: timestamp("atualizado_em", { withTimezone: true }).defaultNow(),
});

export const fipeModelos = pgTable(
  "fipe_modelos",
  {
    codigo: text("codigo").primaryKey(),
    marca: text("marca").notNull(),
    modelo: text("modelo").notNull(),
    ano: integer("ano").notNull(),
    combustivel: text("combustivel"),
    valor: numeric("valor"),
    referencia: text("referencia"),
    slugMarca: text("slug_marca").notNull(),
    slugModelo: text("slug_modelo").notNull(),
  },
  (table) => [
    index("idx_fipe_marca").on(table.slugMarca),
    index("idx_fipe_modelo").on(table.slugMarca, table.slugModelo),
  ],
);
