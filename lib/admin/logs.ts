import "server-only";

import { getDb } from "@/db";
import { adminLogs } from "@/db/schema";

export async function registrarLogAdmin(acao: string, alvo: string): Promise<void> {
  await getDb().insert(adminLogs).values({ acao, alvo });
}
