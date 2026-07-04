import "server-only";

const ENVS_CRITICAS = [
  "DATABASE_URL",
  "ASAAS_API_KEY",
  "ASAAS_WEBHOOK_TOKEN",
  "FORNECEDOR_BASICO_URL",
  "FORNECEDOR_PREMIUM_URL",
  "NEXT_PUBLIC_TURNSTILE_SITE_KEY",
  "TURNSTILE_SECRET_KEY",
  "BREVO_API_KEY",
  "CRON_SECRET",
  "ADMIN_PASSWORD_HASH",
  "ADMIN_SESSION_SECRET",
] as const;

export function checarEnvs(): Array<{ nome: string; definida: boolean }> {
  return ENVS_CRITICAS.map((nome) => ({
    nome,
    definida: Boolean(process.env[nome]),
  }));
}

export async function testarFornecedorBasico(): Promise<{
  ok: boolean;
  latenciaMs: number;
  erro?: string;
}> {
  const inicio = Date.now();
  try {
    const { fornecedorBasico } = await import("@/lib/fornecedores/basico");
    const { PLACA_HEALTH_CHECK } = await import("@/lib/fornecedores/constants");
    const resultado = await fornecedorBasico.consultar(PLACA_HEALTH_CHECK);
    return {
      ok: resultado !== null,
      latenciaMs: Date.now() - inicio,
      erro: resultado ? undefined : "Sem resposta do fornecedor",
    };
  } catch (erro) {
    return {
      ok: false,
      latenciaMs: Date.now() - inicio,
      erro: erro instanceof Error ? erro.message : "Erro desconhecido",
    };
  }
}

export async function testarFornecedorPremium(): Promise<{
  ok: boolean;
  latenciaMs: number;
  erro?: string;
}> {
  const inicio = Date.now();
  try {
    const { fornecedorPremium } = await import("@/lib/fornecedores/premium");
    const { PLACA_HEALTH_CHECK } = await import("@/lib/fornecedores/constants");
    const resultado = await fornecedorPremium.consultar(PLACA_HEALTH_CHECK);
    return {
      ok: resultado !== null,
      latenciaMs: Date.now() - inicio,
      erro: resultado ? undefined : "Sem resposta do fornecedor",
    };
  } catch (erro) {
    return {
      ok: false,
      latenciaMs: Date.now() - inicio,
      erro: erro instanceof Error ? erro.message : "Erro desconhecido",
    };
  }
}
