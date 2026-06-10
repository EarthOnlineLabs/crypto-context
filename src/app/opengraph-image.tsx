import { ImageResponse } from "next/og";

/**
 * Social share card (OpenGraph / Twitter). Pure JSX — no binary assets.
 * Mirrors the landing hero: grid backdrop, emerald glow, the brand line.
 */

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "CryptoContext — Not your context, not your AI.";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#ffffff",
          backgroundImage:
            "radial-gradient(circle at 600px 200px, rgba(16,185,129,0.14), transparent 55%), radial-gradient(circle at 1px 1px, rgba(0,0,0,0.07) 1px, transparent 0)",
          backgroundSize: "100% 100%, 40px 40px",
          fontFamily: "sans-serif",
        }}
      >
        {/* Brand row */}
        <div style={{ display: "flex", alignItems: "center", marginBottom: 36 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              backgroundColor: "#059669",
              marginRight: 16,
            }}
          />
          <div style={{ fontSize: 36, fontWeight: 700, color: "#111827" }}>CryptoContext</div>
        </div>

        {/* Headline */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            lineHeight: 1.1,
          }}
        >
          <div style={{ fontSize: 76, fontWeight: 800, color: "#111827" }}>Not your context,</div>
          <div
            style={{
              fontSize: 76,
              fontWeight: 800,
              backgroundImage: "linear-gradient(135deg, #059669, #14b8a6)",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            not your AI.
          </div>
        </div>

        {/* Subline */}
        <div
          style={{
            marginTop: 36,
            fontSize: 28,
            color: "#6b7280",
            display: "flex",
          }}
        >
          One crypto context every AI agent can read — MCP · skill · copy-paste
        </div>

        {/* Footer chip */}
        <div
          style={{
            marginTop: 44,
            display: "flex",
            alignItems: "center",
            padding: "10px 22px",
            borderRadius: 999,
            border: "1px solid #a7f3d0",
            backgroundColor: "#ecfdf5",
            color: "#047857",
            fontSize: 22,
          }}
        >
          Open source · Free · cryptocontext.aiself.site
        </div>
      </div>
    ),
    { ...size },
  );
}
