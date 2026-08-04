import { ImageResponse } from "next/og";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/site-url";

export const alt = `${SITE_NAME} — ${SITE_TAGLINE}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
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
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <svg width="56" height="40" viewBox="0 0 44 30" fill="none">
            <rect
              x="1"
              y="1"
              width="34"
              height="24"
              rx="4"
              stroke="white"
              strokeWidth="2"
            />
            <rect
              x="1"
              y="1"
              width="34"
              height="7"
              rx="4"
              fill="white"
              opacity="0.15"
            />
            <circle
              cx="30"
              cy="19"
              r="8"
              stroke="white"
              strokeWidth="2"
              fill="white"
              fillOpacity="0.25"
            />
            <path
              d="M36 25L41 28"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
          <span style={{ fontSize: 36, fontWeight: 700 }}>{SITE_NAME}</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              fontSize: 52,
              fontWeight: 800,
              lineHeight: 1.15,
              maxWidth: 980,
            }}
          >
            {SITE_TAGLINE}
          </div>
          <div style={{ fontSize: 26, opacity: 0.85, maxWidth: 900 }}>
            Histórico completo pela placa: leilão, sinistro, roubo, gravame e
            restrições.
          </div>
        </div>

        <div style={{ fontSize: 22, opacity: 0.7 }}>revelaplaca.com.br</div>
      </div>
    ),
    { ...size },
  );
}
