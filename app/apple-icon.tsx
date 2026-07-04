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
        <svg width="132" height="90" viewBox="0 0 44 30" fill="none">
          <rect x="1" y="1" width="34" height="24" rx="4" stroke="white" strokeWidth="2" />
          <rect x="1" y="1" width="34" height="7" rx="4" fill="white" opacity="0.15" />
          <circle cx="30" cy="19" r="8" stroke="white" strokeWidth="2" fill="white" fillOpacity="0.25" />
          <path d="M36 25L41 28" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </div>
    ),
    { ...size },
  );
}
