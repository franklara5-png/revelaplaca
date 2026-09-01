import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/db";
import { siteVisits } from "@/db/schema";
import { isBotUserAgent, isRotaPublica } from "@/lib/track/filtro";
import { visitaRateLimitExcedido } from "@/lib/track/rate-limit";
import { hashIp } from "@/lib/ip-hash";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  path: z.string().max(2048),
  referrer: z.string().max(2048).optional(),
});

function cleanIp(value: string | null | undefined): string | null {
  if (!value) return null;
  const v = value.trim();
  return v.length > 0 ? v : null;
}

function getClientIp(req: Request): string {
  const forwarded =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null;
  return cleanIp(forwarded) || cleanIp(req.headers.get("x-real-ip")) || "unknown";
}

function decodeHeader(value: string | null): string | null {
  if (!value) return null;
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

const displayNamesPt = (() => {
  try {
    return new Intl.DisplayNames(["pt-BR"], { type: "region" });
  } catch {
    return null;
  }
})();

function getCountryName(iso: string | null): string | null {
  if (!iso) return null;
  try {
    return displayNamesPt?.of(iso.toUpperCase()) ?? iso;
  } catch {
    return iso;
  }
}

function getLocationFromHeaders(req: Request) {
  return {
    city: decodeHeader(req.headers.get("x-vercel-ip-city")),
    region: decodeHeader(req.headers.get("x-vercel-ip-country-region")),
    country: getCountryName(req.headers.get("x-vercel-ip-country")),
  };
}

export async function POST(request: Request) {
  let body: z.infer<typeof bodySchema>;
  try {
    body = bodySchema.parse(await request.json());
  } catch {
    return NextResponse.json({ erro: "Requisição inválida." }, { status: 400 });
  }

  // Defesa em profundidade: o VisitTracker já filtra no client, mas a rota
  // não confia nisso — bots e rotas privadas nunca geram linha em site_visits.
  if (!isRotaPublica(body.path)) {
    return NextResponse.json({ ok: true });
  }

  const userAgent = request.headers.get("user-agent");
  if (isBotUserAgent(userAgent)) {
    return NextResponse.json({ ok: true });
  }

  // Hash, nunca o endereco. Se o salt nao estiver configurado, hashIp lanca em
  // producao — e a resposta certa e desistir da visita, NAO cair de volta no
  // IP em claro. Metrica perdida custa menos que dado pessoal guardado errado.
  let ipHash: string;
  try {
    ipHash = hashIp(getClientIp(request));
  } catch (erro) {
    console.error("[track/visit] sem IP_HASH_SALT, visita descartada:", erro);
    return NextResponse.json({ ok: true });
  }

  // Trava de abuso: a rota e POST publico e sem autenticacao. Sem isto,
  // qualquer um insere linha no banco em loop.
  if (await visitaRateLimitExcedido(ipHash)) {
    return NextResponse.json({ ok: true });
  }

  const { city, region, country } = getLocationFromHeaders(request);

  try {
    await getDb()
      .insert(siteVisits)
      .values({
        ipHash,
        path: body.path,
        referrer: body.referrer ?? null,
        userAgent,
        country,
        region,
        city,
      });
  } catch (erro) {
    console.error("[track/visit] falha ao registrar visita:", erro);
  }

  return NextResponse.json({ ok: true });
}
