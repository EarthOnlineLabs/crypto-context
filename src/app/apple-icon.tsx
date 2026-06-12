import { ImageResponse } from "next/og";

/** iOS home-screen icon — the aperture mark on the dark brand tile. */

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
          backgroundColor: "#062E23",
          borderRadius: 36,
        }}
      >
        <svg width="130" height="130" viewBox="0 0 64 64">
          <circle
            cx="32"
            cy="32"
            r="22"
            fill="none"
            stroke="#34d399"
            strokeWidth="5.5"
            strokeLinecap="round"
            strokeDasharray="103.7 34.5"
            transform="rotate(128 32 32)"
          />
          <circle
            cx="32"
            cy="32"
            r="12.5"
            fill="none"
            stroke="#6ee7b7"
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray="58.9 19.6"
            transform="rotate(-38 32 32)"
          />
          <circle cx="32" cy="32" r="5.5" fill="#a7f3d0" />
        </svg>
      </div>
    ),
    { ...size },
  );
}
