import {
  SECOES_RELATORIO,
  type ChaveSecao,
  type MetaRelatorio,
  type RelatorioNormalizado,
  type SecaoRelatorio,
  type StatusSecao,
} from "./types";

function temConteudo(dados: unknown): boolean {
  if (!dados || typeof dados !== "object" || Array.isArray(dados)) return false;
  return Object.keys(dados as Record<string, unknown>).length > 0;
}

function statusDeSecao(
  chave: ChaveSecao,
  dados: unknown,
  meta: MetaRelatorio,
): StatusSecao {
  if (meta.indisponivel?.includes(chave)) return "desconhecido";
  if (dados === undefined) return "desconhecido";
  if (!temConteudo(dados)) return "ok";
  if (chave === "leilao" || chave === "rouboFurto" || chave === "restricoes") {
    return "risco";
  }
  return "alerta";
}

export function normalizarRelatorio(
  placa: string,
  dados: Record<string, unknown>,
): RelatorioNormalizado {
  const meta = (dados._meta as MetaRelatorio | undefined) ?? {};
  const fontePadrao = meta.fonte ?? "Parceiro veicular autorizado";
  const consultadoPadrao = meta.consultadoEm ?? new Date().toISOString();

  const secoes: SecaoRelatorio[] = SECOES_RELATORIO.map(({ chave, titulo }) => {
    const valor = dados[chave];
    const status = statusDeSecao(chave, valor, meta);

    return {
      chave,
      titulo,
      status,
      fonte: status === "desconhecido" ? undefined : fontePadrao,
      consultadoEm: status === "desconhecido" ? undefined : consultadoPadrao,
      dados:
        status === "alerta" || status === "risco"
          ? (valor as Record<string, unknown>)
          : undefined,
    };
  });

  const totalApontamentos = secoes.filter(
    (s) => s.status === "alerta" || s.status === "risco",
  ).length;

  return {
    placa,
    secoes,
    totalVerificacoes: secoes.filter((s) => s.status !== "desconhecido").length,
    totalApontamentos,
  };
}

export function formatarDataHora(iso: string): string {
  try {
    return new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}
