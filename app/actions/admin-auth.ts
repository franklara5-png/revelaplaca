"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  COOKIE_NAME,
  criarSessaoAdmin,
  opcoesCookieSessao,
} from "@/lib/admin/session";
import { hashIp } from "@/lib/admin/auth";
import {
  loginBloqueado,
  registrarTentativaLogin,
} from "@/lib/admin/rate-limit";
import { verificarSenhaAdmin } from "@/lib/admin/password";

export type LoginAdminResult =
  | { ok: true }
  | { ok: false; erro: string };

function obterIp(headersList: Headers): string {
  return (
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headersList.get("x-real-ip") ??
    "unknown"
  );
}

export async function loginAdmin(senha: string): Promise<LoginAdminResult> {
  const headersList = await headers();
  const ipHash = hashIp(obterIp(headersList));

  if (await loginBloqueado(ipHash)) {
    return {
      ok: false,
      erro: "Muitas tentativas. Aguarde 15 minutos e tente novamente.",
    };
  }

  const valida = await verificarSenhaAdmin(senha);
  await registrarTentativaLogin(ipHash);

  if (!valida) {
    return { ok: false, erro: "Senha incorreta." };
  }

  const token = await criarSessaoAdmin();
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, opcoesCookieSessao());

  return { ok: true };
}

export async function logoutAdmin(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
  redirect("/admin/login");
}
