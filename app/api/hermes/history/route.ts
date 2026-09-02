import { NextResponse } from "next/server";
import { authorizeHermes } from "@/lib/hermes-auth";
import { getHermesHistory } from "@/lib/hermes/history";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!authorizeHermes(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const history = await getHermesHistory();
  return NextResponse.json(history, {
    headers: { "Cache-Control": "no-store" },
  });
}
