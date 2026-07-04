"use server";

import { revalidatePath } from "next/cache";
import { registrarLogAdmin } from "@/lib/admin/logs";
import { gerarRelatorioParaPedido, reenviarEmailRelatorio } from "@/lib/relatorios";

export async function reprocessarRelatorioPedido(formData: FormData) {
  const pedidoId = String(formData.get("pedidoId") ?? "");
  if (!pedidoId) return;

  await gerarRelatorioParaPedido(pedidoId);
  await registrarLogAdmin("reprocessar_relatorio", pedidoId);
  revalidatePath("/admin/pedidos");
}

export async function reenviarEmailPedido(formData: FormData) {
  const pedidoId = String(formData.get("pedidoId") ?? "");
  if (!pedidoId) return;

  await reenviarEmailRelatorio(pedidoId);
  await registrarLogAdmin("reenviar_email", pedidoId);
  revalidatePath("/admin/pedidos");
}
