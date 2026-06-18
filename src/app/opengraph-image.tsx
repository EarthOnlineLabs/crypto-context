import { ImageResponse } from "next/og";

/**
 * Social share card (OpenGraph / Twitter). Pure JSX — no binary assets.
 * The ink-panel aesthetic from the landing's proof terminal: deep green-black,
 * emerald glow, the aperture mark, the brand line.
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
          backgroundColor: "#081410",
          backgroundImage:
            "radial-gradient(900px 500px at 18% 0%, rgba(16,185,129,0.18), transparent 55%), radial-gradient(800px 480px at 90% 110%, rgba(20,184,166,0.12), transparent 55%), linear-gradient(rgba(52,211,153,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(52,211,153,0.05) 1px, transparent 1px)",
          backgroundSize: "100% 100%, 100% 100%, 56px 56px, 56px 56px",
          fontFamily: "sans-serif",
        }}
      >
        {/* Brand row */}
        <div style={{ display: "flex", alignItems: "center", marginBottom: 40 }}>
          <svg width="52" height="52" viewBox="0 0 64 64" style={{ marginRight: 16 }}>
            <rect width="64" height="64" rx="14" fill="#062E23" />
            <circle
              cx="32" cy="32" r="22" fill="none" stroke="#34d399" strokeWidth="5.5"
              strokeLinecap="round" strokeDasharray="103.7 34.5" transform="rotate(128 32 32)"
            />
            <circle
              cx="32" cy="32" r="12.5" fill="none" stroke="#6ee7b7" strokeWidth="5"
              strokeLinecap="round" strokeDasharray="58.9 19.6" transform="rotate(-38 32 32)"
            />
            <circle cx="32" cy="32" r="5.5" fill="#a7f3d0" />
          </svg>
          <div style={{ fontSize: 36, fontWeight: 700, color: "#ecfdf5" }}>CryptoContext</div>
        </div>

        {/* Headline */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            lineHeight: 1.08,
          }}
        >
          <div style={{ fontSize: 78, fontWeight: 800, color: "#ecfdf5", letterSpacing: -2 }}>
            Not your context,
          </div>
          <div
            style={{
              fontSize: 78,
              fontWeight: 800,
              letterSpacing: -2,
              backgroundImage: "linear-gradient(135deg, #34d399, #2dd4bf)",
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
            fontSize: 27,
            color: "rgba(209,250,229,0.55)",
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
            padding: "10px 24px",
            borderRadius: 999,
            border: "1px solid rgba(52,211,153,0.35)",
            backgroundColor: "rgba(16,185,129,0.1)",
            color: "#6ee7b7",
            fontSize: 22,
          }}
        >
          16 exchanges · 8 chains · open source · cryptocontext.earthonline.site
        </div>
      </div>
    ),
    { ...size },
  );
}
