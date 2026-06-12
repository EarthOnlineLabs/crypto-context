/**
 * CryptoContext brand mark — "the aperture".
 *
 * Two broken concentric arcs converging on a solid core: the user's context at
 * the center, venue data layering in through the openings. Reads as an aperture
 * (an eye for your AI) and stays legible at 16px favicon size.
 */

interface MarkProps {
  /** Pixel size of the square mark. */
  size?: number;
  /** "tile" renders on the dark brand tile (favicon-style); "plain" inherits layout bg. */
  variant?: "plain" | "tile";
  className?: string;
}

export function LogoMark({ size = 32, variant = "plain", className }: MarkProps) {
  const arcs = (
    <>
      {/* outer arc — 3/4 sweep, opening at the upper right */}
      <circle
        cx="32"
        cy="32"
        r="22"
        fill="none"
        stroke={variant === "tile" ? "#34d399" : "#047857"}
        strokeWidth="5.5"
        strokeLinecap="round"
        strokeDasharray="103.7 34.5"
        transform="rotate(128 32 32)"
      />
      {/* inner arc — opening opposite, so data "flows through" */}
      <circle
        cx="32"
        cy="32"
        r="12.5"
        fill="none"
        stroke={variant === "tile" ? "#6ee7b7" : "#10b981"}
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray="58.9 19.6"
        transform="rotate(-38 32 32)"
      />
      {/* the core: your context */}
      <circle cx="32" cy="32" r="5.5" fill={variant === "tile" ? "#a7f3d0" : "#059669"} />
    </>
  );

  if (variant === "tile") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        className={className}
        aria-hidden="true"
      >
        <rect width="64" height="64" rx="14" fill="#062E23" />
        {arcs}
      </svg>
    );
  }

  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className} aria-hidden="true">
      {arcs}
    </svg>
  );
}

interface WordmarkProps {
  /** Overall scale: "sm" for app chrome, "md" for nav/auth headers. */
  size?: "sm" | "md";
  className?: string;
}

/** Mark + name lockup used in navs, auth pages, and the dashboard shell. */
export function LogoWordmark({ size = "md", className }: WordmarkProps) {
  const mark = size === "sm" ? 26 : 30;
  return (
    <span className={`inline-flex items-center gap-2 ${className ?? ""}`}>
      <LogoMark size={mark} variant="tile" />
      <span
        className={`font-semibold tracking-tight text-gray-900 ${
          size === "sm" ? "text-sm" : "text-lg"
        }`}
      >
        CryptoContext
      </span>
    </span>
  );
}
