-- Sprint 1.5: recuperação de checkout, admin logs e rate limit de login

ALTER TABLE pedidos
  ADD COLUMN IF NOT EXISTS email_recuperacao_enviado boolean NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS admin_login_tentativas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_hash text NOT NULL,
  criada_em timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_admin_login_ip ON admin_login_tentativas (ip_hash, criada_em);

CREATE TABLE IF NOT EXISTS admin_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  acao text NOT NULL,
  alvo text NOT NULL,
  criado_em timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_admin_logs_criado ON admin_logs (criado_em DESC);
