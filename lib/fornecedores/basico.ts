import "server-only";

import type { ConsultaBasica, FornecedorBasico } from "./types";
import { sanitizarDados } from "./sanitize";

const TIMEOUT_MS = 8_000;

function lerNumero(valor: unknown): number | null {
  if (valor === null || valor === undefined || valor === "") return null;
  const n = Number(valor);
  return Number.isFinite(n) ? n : null;
}

function lerTexto(valor: unknown): string | null {
  if (valor === null || valor === undefined) return null;
  const t = String(valor).trim();
  return t || null;
}

function extrairDeResposta(
  bruto: Record<string, unknown>,
  placa: string,
): ConsultaBasica {
  const raiz =
    (bruto.data as Record<string, unknown> | undefined) ??
    (bruto.veiculo as Record<string, unknown> | undefined) ??
    (bruto.vehicle as Record<string, unknown> | undefined) ??
    bruto;

  const fipe =
    (raiz.fipe as Record<string, unknown> | undefined) ??
    (raiz.tabela_fipe as Record<string, unknown> | undefined);

  return {
    placa,
    marca: lerTexto(raiz.marca ?? raiz.brand ?? raiz.fabricante),
    modelo: lerTexto(raiz.modelo ?? raiz.model),
    versao: lerTexto(raiz.versao ?? raiz.version ?? raiz.versão),
    anoFabricacao: lerNumero(
      raiz.ano_fabricacao ?? raiz.anoFabricacao ?? raiz.year,
    ),
    anoModelo: lerNumero(raiz.ano_modelo ?? raiz.anoModelo ?? raiz.model_year),
    cor: lerTexto(raiz.cor ?? raiz.color),
    municipio: lerTexto(raiz.municipio ?? raiz.city ?? raiz.cidade),
    uf: lerTexto(raiz.uf ?? raiz.state),
    combustivel: lerTexto(raiz.combustivel ?? raiz.fuel ?? raiz.combustível),
    segmento: lerTexto(raiz.segmento ?? raiz.segment ?? raiz.tipo),
    chassiParcial: lerTexto(
      raiz.chassi_parcial ??
        raiz.chassiParcial ??
        raiz.chassi ??
        raiz.chassis,
    ),
    fipeCodigo: lerTexto(
      fipe?.codigo ?? fipe?.code ?? raiz.fipe_codigo ?? raiz.fipeCodigo,
    ),
    fipeValor: lerNumero(
      fipe?.valor ?? fipe?.value ?? raiz.fipe_valor ?? raiz.fipeValor,
    ),
    fipeReferencia: lerTexto(
      fipe?.referencia ??
        fipe?.reference ??
        raiz.fipe_referencia ??
        raiz.fipeReferencia,
    ),
  };
}

async function chamarFornecedor(
  placa: string,
  tentativa: number,
): Promise<ConsultaBasica | null> {
  const urlBase = process.env.FORNECEDOR_BASICO_URL;
  const token = process.env.FORNECEDOR_BASICO_TOKEN;

  if (!urlBase) {
    console.error("[fornecedor-basico] FORNECEDOR_BASICO_URL não configurada");
    return null;
  }

  const url = urlBase.includes("{placa}")
    ? urlBase.replace("{placa}", placa)
    : `${urlBase.replace(/\/$/, "")}/${placa}`;

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(token ? { "X-Api-Key": token } : {}),
      },
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: "no-store",
    });

    if (!res.ok) {
      console.error(
        `[fornecedor-basico] HTTP ${res.status} (tentativa ${tentativa})`,
      );
      return null;
    }

    const bruto = sanitizarDados(
      (await res.json()) as Record<string, unknown>,
    );
    return extrairDeResposta(bruto, placa);
  } catch (erro) {
    console.error(`[fornecedor-basico] erro (tentativa ${tentativa}):`, erro);
    return null;
  }
}

export const fornecedorBasico: FornecedorBasico = {
  async consultar(placa: string) {
    const primeira = await chamarFornecedor(placa, 1);
    if (primeira) return primeira;
    return chamarFornecedor(placa, 2);
  },
};
