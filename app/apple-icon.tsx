import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0d545d",
          borderRadius: 36,
        }}
      >
        {/* Marca "metade revelada" — mesma geometria de components/brand/Logo.tsx */}
        <svg width="124" height="64" viewBox="3 17 58 30" fill="none">
          <path
            d="M32 22h20.5a4.5 4.5 0 0 1 4.5 4.5v11a4.5 4.5 0 0 1-4.5 4.5H32z"
            fill="white"
          />
          <rect
            x="5"
            y="20"
            width="54"
            height="24"
            rx="6"
            stroke="white"
            strokeWidth="4"
          />
          <rect x="13" y="29" width="13" height="4" rx="2" fill="white" />
          <rect x="13" y="36" width="9" height="4" rx="2" fill="white" />
        </svg>
      </div>
    ),
    { ...size },
  );
}
