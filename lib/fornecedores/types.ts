export type ConsultaBasica = {
  placa: string;
  marca?: string | null;
  modelo?: string | null;
  versao?: string | null;
  anoFabricacao?: number | null;
  anoModelo?: number | null;
  cor?: string | null;
  municipio?: string | null;
  uf?: string | null;
  combustivel?: string | null;
  segmento?: string | null;
  chassiParcial?: string | null;
  fipeCodigo?: string | null;
  fipeValor?: number | null;
  fipeReferencia?: string | null;
};

export type ConsultaPremium = {
  placa: string;
  leilao?: Record<string, unknown> | null;
  sinistro?: Record<string, unknown> | null;
  rouboFurto?: Record<string, unknown> | null;
  gravame?: Record<string, unknown> | null;
  restricoes?: Record<string, unknown> | null;
  debitos?: Record<string, unknown> | null;
};

export type FornecedorBasico = {
  consultar(placa: string): Promise<ConsultaBasica | null>;
};

export type FornecedorPremium = {
  consultar(placa: string): Promise<ConsultaPremium | null>;
};
