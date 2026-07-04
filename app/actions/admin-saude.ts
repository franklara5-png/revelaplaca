"use server";

import { revalidatePath } from "next/cache";
import { registrarLogAdmin } from "@/lib/admin/logs";
import { testarFornecedorBasico, testarFornecedorPremium } from "@/lib/admin/saude";

export async function testarFornecedorBasicoAction() {
  const resultado = await testarFornecedorBasico();
  await registrarLogAdmin("testar_fornecedor_basico", resultado.ok ? "ok" : "erro");
  revalidatePath("/admin/saude");
  return resultado;
}

export async function testarFornecedorPremiumAction() {
  const resultado = await testarFornecedorPremium();
  await registrarLogAdmin("testar_fornecedor_premium", resultado.ok ? "ok" : "erro");
  revalidatePath("/admin/saude");
  return resultado;
}
