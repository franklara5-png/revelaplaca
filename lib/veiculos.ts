import "server-only";

import { eq, gt, and, ne, desc } from "drizzle-orm";
import { getDb } from "@/db";
import { veiculos } from "@/db/schema";
import type { ConsultaBasica } from "@/lib/fornecedores/types";
import { fornecedorBasico } from "@/lib/fornecedores/basico";
import { sanitizarDados } from "@/lib/fornecedores/sanitize";
import { slugify } from "@/lib/slug";

const TTL_DIAS = 30;

export type VeiculoCache = typeof veiculos.$inferSelect;

export function cacheValido(veiculo: VeiculoCache): boolean {
  if (!veiculo.expiraEm) return false;
  return veiculo.expiraEm.getTime() > Date.now();
}

export async function buscarVeiculoCache(
  placa: string,
): Promise<VeiculoCache | null> {
  if (!process.env.DATABASE_URL) return null;

  const [registro] = await getDb()
    .select()
    .from(veiculos)
    .where(and(eq(veiculos.placa, placa), gt(veiculos.expiraEm, new Date())))
    .limit(1);

  return registro ?? null;
}

export async function buscarOutrosModelo(
  modelo: string,
  placaAtual: string,
  limite = 6,
): Promise<VeiculoCache[]> {
  if (!process.env.DATABASE_URL) return [];

  return getDb()
    .select()
    .from(veiculos)
    .where(
      and(
        eq(veiculos.modelo, modelo),
        ne(veiculos.placa, placaAtual),
        gt(veiculos.expiraEm, new Date()),
      ),
    )
    .orderBy(desc(veiculos.consultadoEm))
    .limit(limite);
}

function calcularExpiracao(): Date {
  const expira = new Date();
  expira.setDate(expira.getDate() + TTL_DIAS);
  return expira;
}

export function veiculoParaResposta(veiculo: VeiculoCache): ConsultaBasica {
  return {
    placa: veiculo.placa,
    marca: veiculo.marca,
    modelo: veiculo.modelo,
    versao: veiculo.versao,
    anoFabricacao: veiculo.anoFabricacao,
    anoModelo: veiculo.anoModelo,
    cor: veiculo.cor,
    municipio: veiculo.municipio,
    uf: veiculo.uf,
    combustivel: veiculo.combustivel,
    segmento: veiculo.segmento,
    chassiParcial: veiculo.chassiParcial,
    fipeCodigo: veiculo.fipeCodigo,
    fipeValor: veiculo.fipeValor ? Number(veiculo.fipeValor) : null,
    fipeReferencia: veiculo.fipeReferencia,
  };
}

export async function persistirVeiculo(
  dados: ConsultaBasica,
  dadosBrutos: Record<string, unknown>,
) {
  const expiraEm = calcularExpiracao();
  const sanitizado = sanitizarDados(dadosBrutos);

  await getDb()
    .insert(veiculos)
    .values({
      placa: dados.placa,
      marca: dados.marca,
      modelo: dados.modelo,
      versao: dados.versao,
      anoFabricacao: dados.anoFabricacao,
      anoModelo: dados.anoModelo,
      cor: dados.cor,
      municipio: dados.municipio,
      uf: dados.uf,
      combustivel: dados.combustivel,
      segmento: dados.segmento,
      chassiParcial: dados.chassiParcial,
      fipeCodigo: dados.fipeCodigo,
      fipeValor: dados.fipeValor?.toString() ?? null,
      fipeReferencia: dados.fipeReferencia,
      dadosBrutos: sanitizado,
      expiraEm,
    })
    .onConflictDoUpdate({
      target: veiculos.placa,
      set: {
        marca: dados.marca,
        modelo: dados.modelo,
        versao: dados.versao,
        anoFabricacao: dados.anoFabricacao,
        anoModelo: dados.anoModelo,
        cor: dados.cor,
        municipio: dados.municipio,
        uf: dados.uf,
        combustivel: dados.combustivel,
        segmento: dados.segmento,
        chassiParcial: dados.chassiParcial,
        fipeCodigo: dados.fipeCodigo,
        fipeValor: dados.fipeValor?.toString() ?? null,
        fipeReferencia: dados.fipeReferencia,
        dadosBrutos: sanitizado,
        consultadoEm: new Date(),
        expiraEm,
      },
    });

  return buscarVeiculoCache(dados.placa);
}

export async function consultarFornecedorBasico(
  placa: string,
): Promise<{ dados: ConsultaBasica; bruto: Record<string, unknown> } | null> {
  const resultado = await fornecedorBasico.consultar(placa);
  if (!resultado) return null;

  const bruto = sanitizarDados({
    ...resultado,
    placa,
  }) as Record<string, unknown>;

  return { dados: resultado, bruto };
}

export function formatarValorFipe(valor: number | null | undefined): string {
  if (valor === null || valor === undefined) return "—";
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export { slugify } from "@/lib/slug";
