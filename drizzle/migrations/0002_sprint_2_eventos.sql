-- Sprint 2: eventos de funil

CREATE TABLE IF NOT EXISTS eventos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  placa text,
  meta jsonb,
  criado_em timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_eventos_nome_criado ON eventos (nome, criado_em DESC);

CREATE TABLE IF NOT EXISTS eventos_api_rate (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_hash text NOT NULL,
  criada_em timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_eventos_api_rate_ip ON eventos_api_rate (ip_hash, criada_em);
