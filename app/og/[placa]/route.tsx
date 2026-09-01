import { ImageResponse } from "next/og";
import { eq, gt, and } from "drizzle-orm";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { veiculos } from "@/db/schema";
import { formatarPlaca, normalizarPlaca, validarPlaca } from "@/lib/placa";
import { formatarValorFipe } from "@/lib/fipe";
import { getSiteUrl, SITE_NAME } from "@/lib/site-url";

export const runtime = "nodejs";

type Props = {
  params: Promise<{ placa: string }>;
};

export async function GET(_request: Request, { params }: Props) {
  const { placa: placaParam } = await params;
  const placa = normalizarPlaca(placaParam);
  const placaFmt = validarPlaca(placa) ? formatarPlaca(placa) : placaParam;

  const cache = validarPlaca(placa)
    ? await (async () => {
        const url = process.env.DATABASE_URL;
        if (!url) return null;
        const db = drizzle(neon(url));
        const [row] = await db
          .select()
          .from(veiculos)
          .where(and(eq(veiculos.placa, placa), gt(veiculos.expiraEm, new Date())))
          .limit(1);
        return row ?? null;
      })()
    : null;

  const titulo =
    cache?.marca && cache?.modelo
      ? `${cache.marca} ${cache.modelo}`
      : "Checagem veicular";

  const subtitulo = [
    cache?.anoModelo ?? cache?.anoFabricacao,
    cache?.cor,
  ]
    .filter(Boolean)
    .join(" · ");

  const fipe = cache?.fipeValor
    ? formatarValorFipe(Number(cache.fipeValor))
    : null;

  const dominio = new URL(getSiteUrl()).host;

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #0D545D 0%, #05282E 100%)",
          color: "white",
          padding: 64,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {/* Marca "metade revelada" — mesma geometria de components/brand/Logo.tsx */}
            <svg width="62" height="32" viewBox="3 17 58 30" fill="none">
              <path d="M32 22h20.5a4.5 4.5 0 0 1 4.5 4.5v11a4.5 4.5 0 0 1-4.5 4.5H32z" fill="white" />
              <rect x="5" y="20" width="54" height="24" rx="6" stroke="white" strokeWidth="4" />
              <rect x="13" y="29" width="13" height="4" rx="2" fill="white" />
              <rect x="13" y="36" width="9" height="4" rx="2" fill="white" />
            </svg>
            <span style={{ fontSize: 28, fontWeight: 700 }}>{SITE_NAME}</span>
          </div>
          <span
            style={{
              fontSize: 36,
              fontWeight: 800,
              letterSpacing: 6,
            }}
          >
            {placaFmt}
          </span>
        </div>

        {/* display explicito: o Satori recusa <div> com mais de um filho sem
            display definido, e este bloco tem titulo + subtitulo + FIPE. Sem
            isto a rota inteira responde erro e a OG da consulta nao existe. */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 52, fontWeight: 800, lineHeight: 1.1 }}>
            {titulo}
          </div>
          {subtitulo && (
            <div style={{ fontSize: 28, marginTop: 16, opacity: 0.85 }}>
              {subtitulo}
            </div>
          )}
          {fipe && (
            <div
              style={{
                marginTop: 32,
                fontSize: 32,
                fontWeight: 700,
                background: "rgba(255,255,255,0.12)",
                borderRadius: 16,
                padding: "16px 24px",
                display: "inline-block",
              }}
            >
              FIPE: {fipe}
            </div>
          )}
        </div>

        <div style={{ fontSize: 22, opacity: 0.7 }}>{dominio}</div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
