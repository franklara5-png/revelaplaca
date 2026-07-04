import "server-only";

import bcrypt from "bcryptjs";

export async function verificarSenhaAdmin(senha: string): Promise<boolean> {
  const hash = process.env.ADMIN_PASSWORD_HASH;
  if (!hash) return false;
  return bcrypt.compare(senha, hash);
}
