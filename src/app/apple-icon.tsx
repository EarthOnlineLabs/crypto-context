import { ImageResponse } from "next/og";

/** iOS home-screen icon — emerald cube on a soft emerald tile. */

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
          backgroundColor: "#ecfdf5",
          borderRadius: 36,
        }}
      >
        <svg width="120" height="120" viewBox="0 0 64 64">
          <path d="M32 12 L50 21 L32 30 L14 21 Z" fill="#059669" />
          <path d="M14 25 L30 33 L30 50 L14 42 Z" fill="#10b981" />
          <path d="M50 25 L34 33 L34 50 L50 42 Z" fill="#34d399" />
        </svg>
      </div>
    ),
    { ...size },
  );
}
