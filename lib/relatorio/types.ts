export type StatusSecao = "ok" | "alerta" | "risco" | "desconhecido";

export type SecaoRelatorio = {
  chave: string;
  titulo: string;
  status: StatusSecao;
  fonte?: string;
  consultadoEm?: string;
  dados?: Record<string, unknown>;
};

export type RelatorioNormalizado = {
  placa: string;
  secoes: SecaoRelatorio[];
  totalVerificacoes: number;
  totalApontamentos: number;
};

export const SECOES_RELATORIO = [
  { chave: "leilao", titulo: "Leilão e remarketing" },
  { chave: "sinistro", titulo: "Sinistro" },
  { chave: "rouboFurto", titulo: "Roubo e furto" },
  { chave: "gravame", titulo: "Gravame" },
  { chave: "restricoes", titulo: "Restrições" },
  { chave: "debitos", titulo: "Débitos" },
] as const;

export type ChaveSecao = (typeof SECOES_RELATORIO)[number]["chave"];

export type MetaRelatorio = {
  fonte?: string;
  consultadoEm?: string;
  indisponivel?: string[];
};
