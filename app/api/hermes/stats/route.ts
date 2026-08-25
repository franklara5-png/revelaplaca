import { NextResponse } from "next/server";
import { authorizeHermes } from "@/lib/hermes-auth";
import { getHermesStats } from "@/lib/hermes/stats";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!authorizeHermes(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const stats = await getHermesStats();
  return NextResponse.json(stats, { headers: { "Cache-Control": "no-store" } });
}
