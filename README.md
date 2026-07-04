# RevelaPlaca

SaaS de consulta veicular pela placa — revele o histórico antes de comprar. Consulta básica grátis, relatório completo pago (Pix/cartão via Asaas), SEO programático (FIPE + placas cacheadas) e blog MDX.

**Tagline:** O que o vendedor não conta, a placa revela.

**Stack:** Next.js 16 · React 19 · Tailwind CSS 4 · Neon (Postgres) · Drizzle ORM · Vercel

## Desenvolvimento local

```bash
cp .env.example .env.local
# Preencher DATABASE_URL, chaves Asaas, Turnstile, fornecedores…

npm install
npm run db:push          # schema no Neon
npm run import:fipe      # opcional — popular tabela FIPE (demorado)
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

## Scripts

| Comando | Descrição |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run db:push` | Aplica schema Drizzle no Neon |
| `npm run db:migrate` | Migrations Drizzle |
| `npm run import:fipe` | Importa Tabela FIPE (API parallelum) |

Variáveis úteis para import FIPE:

- `FIPE_IMPORT_DELAY_MS=350` — delay entre requests
- `FIPE_IMPORT_LIMIT=5` — limitar marcas (teste)

## Estrutura principal

```
app/
  consulta/[placa]     # Resultado grátis (SEO)
  checkout/[placa]     # Pagamento Asaas
  exemplo/             # Relatório ilustrativo (SEO)
  admin/               # Painel administrativo (noindex)
  tabela-fipe/         # Páginas programáticas FIPE
  blog/                # MDX em content/blog/
  api/consulta         # Consulta grátis
  api/webhooks/asaas   # Confirmação de pagamento
content/blog/*.mdx     # Posts do blog
lib/seo.ts             # getSeoMetadata()
scripts/importa-fipe.ts
```

## Checklist de deploy (Vercel)

### 1. Repositório e projeto

- [ ] Push para GitHub/GitLab
- [ ] Importar projeto na [Vercel](https://vercel.com)
- [ ] Framework preset: **Next.js**

### 2. Banco de dados (Neon)

- [ ] Criar projeto em [Neon](https://neon.tech)
- [ ] Copiar `DATABASE_URL` (pooler recomendado)
- [ ] Rodar `npm run db:push` localmente ou via CI antes do primeiro tráfego
- [ ] Rodar `npm run import:fipe` (completo ou incremental)

### 3. Variáveis de ambiente (Vercel → Settings → Environment Variables)

| Variável | Obrigatória |
|---|---|
| `DATABASE_URL` | Sim |
| `NEXT_PUBLIC_SITE_URL` | Sim (ex.: `https://revelaplaca.com.br`) |
| `ASAAS_API_KEY` | Sim (pagamentos) |
| `ASAAS_WEBHOOK_TOKEN` | Sim |
| `ASAAS_ENV` | Sim (`sandbox` ou `production`) |
| `FORNECEDOR_BASICO_URL` | Sim |
| `FORNECEDOR_BASICO_TOKEN` | Conforme API |
| `FORNECEDOR_PREMIUM_URL` | Sim (relatório) |
| `FORNECEDOR_PREMIUM_TOKEN` | Conforme API |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Sim |
| `TURNSTILE_SECRET_KEY` | Sim |
| `IP_HASH_SALT` | Sim (segredo aleatório) |
| `BREVO_API_KEY` | Recomendado (e-mail relatório) |
| `BREVO_SENDER_EMAIL` | Se usar Brevo |
| `BREVO_SENDER_NAME` | Se usar Brevo (ex.: `RevelaPlaca`) |
| `ADMIN_PASSWORD_HASH` | Sim (painel `/admin`) |
| `ADMIN_SESSION_SECRET` | Sim (cookie de sessão admin) |
| `CRON_SECRET` | Sim (protege `/api/cron/recupera-abandono`) |

### Admin (`/admin`)

Gerar credenciais localmente:

```bash
node scripts/gera-hash-admin.mjs "sua-senha-forte"
```

Copie `ADMIN_PASSWORD_HASH`, `ADMIN_SESSION_SECRET` e `CRON_SECRET` para `.env.local` / Vercel.

- Login em `/admin/login` (senha única, rate limit 5 tentativas/IP/15 min)
- Painel com `noindex` e `Disallow: /admin` no robots

### Recuperação de checkout abandonado (cron)

Rota: `GET /api/cron/recupera-abandono` com header `Authorization: Bearer $CRON_SECRET`.

**Opção A — Vercel Cron (fallback, plano Hobby):** `vercel.json` já agenda 1×/dia às 09:00 UTC.

**Opção B — Agendamento externo (recomendado, a cada 30 min):**

1. Crie conta em [cron-job.org](https://cron-job.org)
2. Nova tarefa: URL `https://revelaplaca.com.br/api/cron/recupera-abandono`
3. Método `GET`, header `Authorization: Bearer SEU_CRON_SECRET`
4. Intervalo: a cada 30 minutos
5. Remova ou desative o cron do `vercel.json` se usar só o externo

Teste local:

```bash
curl -H "Authorization: Bearer SEU_CRON_SECRET" http://localhost:3000/api/cron/recupera-abandono
```

### 4. Asaas

- [ ] Conta sandbox/produção configurada
- [ ] Webhook apontando para `https://revelaplaca.com.br/api/webhooks/asaas`
- [ ] Header `asaas-access-token` = valor de `ASAAS_WEBHOOK_TOKEN`
- [ ] Eventos: `PAYMENT_RECEIVED`, `PAYMENT_CONFIRMED`

### 5. Cloudflare Turnstile

- [ ] Widget criado em [Cloudflare Dashboard](https://dash.cloudflare.com)
- [ ] Domínio de produção (e localhost para dev) autorizado

### 6. Domínio e SSL

- [ ] Domínio customizado `revelaplaca.com.br` na Vercel
- [ ] `NEXT_PUBLIC_SITE_URL` atualizado com domínio final
- [ ] Redeploy após alterar env vars

### 7. Pós-deploy

- [ ] Testar consulta grátis (`/` → placa → Turnstile → resultado)
- [ ] Testar checkout Pix sandbox
- [ ] Confirmar webhook gera relatório + e-mail
- [ ] Verificar `/sitemap.xml` e `/robots.txt`
- [ ] Enviar sitemap no Google Search Console
- [ ] Conferir Vercel Analytics no dashboard

## LGPD (regras do produto)

- Exibir e persistir apenas **dados do veículo**
- Nunca mostrar nome, CPF/CNPJ ou endereço do proprietário
- Consulta grátis só após Turnstile + rate limit + cache
- Sem depoimentos ou contadores fabricados

## Licença

Projeto privado — todos os direitos reservados.
