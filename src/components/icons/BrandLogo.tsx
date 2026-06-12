/**
 * Brand logo tiles — app-icon style marks for exchanges, chains and wallet apps.
 *
 * Design rules:
 * - Every tile is the brand's OFFICIAL background colour + a geometric mark
 *   drawn inline (no external assets, no gradients → no SVG id collisions).
 * - Brands whose identity is a wordmark get their official colour + bold
 *   initial — exactly how their own app icons read on a phone home screen.
 * - Unknown ids fall back to the registry monogram, so new venues degrade
 *   gracefully instead of breaking.
 *
 * All marks are drawn in a 32×32 viewBox. Trademarks are used nominatively to
 * indicate interoperability (same practice as every wallet-connect modal).
 */

import type { ReactNode } from "react";
import {
  getWalletBrand,
  CHAIN_BRANDS,
  EXCHANGE_BRANDS,
} from "@/lib/wallets/brands";

interface LogoDef {
  bg: string;
  mark: ReactNode;
}

/** Bold single-letter mark (the app-icon convention for wordmark brands). */
function letter(ch: string, fill = "#FFFFFF"): ReactNode {
  return (
    <text
      x="16"
      y="16.5"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize="15"
      fontWeight="700"
      fontFamily="var(--font-sans), system-ui, sans-serif"
      fill={fill}
    >
      {ch}
    </text>
  );
}

/** Diamond path centered at (cx, cy) with radius r. */
function diamond(cx: number, cy: number, r: number): string {
  return `M${cx} ${cy - r}L${cx + r} ${cy}L${cx} ${cy + r}L${cx - r} ${cy}Z`;
}

const BINANCE_MARK = (fill: string) => (
  <path
    fill={fill}
    d={[
      diamond(16, 16, 3.3),
      diamond(16, 9.1, 3.3),
      diamond(16, 22.9, 3.3),
      diamond(9.1, 16, 3.3),
      diamond(22.9, 16, 3.3),
    ].join("")}
  />
);

const OKX_MARK = (
  <g fill="#FFFFFF">
    <rect x="7.9" y="7.9" width="5.5" height="5.5" />
    <rect x="18.6" y="7.9" width="5.5" height="5.5" />
    <rect x="13.25" y="13.25" width="5.5" height="5.5" />
    <rect x="7.9" y="18.6" width="5.5" height="5.5" />
    <rect x="18.6" y="18.6" width="5.5" height="5.5" />
  </g>
);

const COINBASE_MARK = (
  <g>
    <circle cx="16" cy="16" r="9.2" fill="#FFFFFF" />
    <rect x="11.6" y="14.6" width="8.8" height="2.8" rx="1.1" fill="#0052FF" />
  </g>
);

/** The shared logo registry. Chains, exchanges and wallet apps share one id space. */
const LOGOS: Record<string, LogoDef> = {
  // ---------- Chains ----------
  ethereum: {
    bg: "#627EEA",
    mark: (
      <g fill="#FFFFFF">
        <path opacity="0.9" d="M16 5L22.6 16.2L16 20L9.4 16.2Z" />
        <path opacity="0.65" d="M16 21.6L22.6 17.7L16 27L9.4 17.7Z" />
      </g>
    ),
  },
  bsc: { bg: "#F0B90B", mark: BINANCE_MARK("#FFFFFF") },
  polygon: {
    bg: "#8247E5",
    mark: (
      <path
        d="M16 7.2L23.6 11.6V20.4L16 24.8L8.4 20.4V11.6Z"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="2.6"
        strokeLinejoin="round"
      />
    ),
  },
  arbitrum: {
    bg: "#213147",
    mark: (
      <g>
        <path d="M13.4 8.6L7 23.4H10.4L15.4 10.8Z" fill="#12AAFF" />
        <path d="M17.6 12.8L13.2 23.4H16.6L19.8 15.2Z" fill="#FFFFFF" />
        <path d="M19.2 8.6L25 23.4H21.6L17.5 12.9Z" fill="#9DCCED" />
      </g>
    ),
  },
  base: {
    bg: "#0052FF",
    mark: (
      <g>
        <circle cx="16" cy="16" r="9.2" fill="#FFFFFF" />
        <rect x="3.5" y="14.7" width="13" height="2.6" fill="#0052FF" />
      </g>
    ),
  },
  optimism: {
    bg: "#FF0420",
    mark: (
      <g fill="#FFFFFF">
        <path
          fillRule="evenodd"
          d="M11 11.6a4.4 4.4 0 1 0 0 8.8a4.4 4.4 0 0 0 0-8.8Zm0 2.6a1.8 1.8 0 1 1 0 3.6a1.8 1.8 0 0 1 0-3.6Z"
        />
        <path
          fillRule="evenodd"
          d="M17.4 11.8h4.1a3.4 3.4 0 0 1 0 6.8h-1.6v1.8h-2.5Zm2.5 2.4v2h1.5a1 1 0 0 0 0-2Z"
        />
      </g>
    ),
  },
  avalanche: {
    bg: "#E84142",
    mark: (
      <g>
        <path d="M16 6.5L26.5 24.5H5.5Z" fill="#FFFFFF" />
        <path d="M16 14.6L21.2 24.5H10.8Z" fill="#E84142" />
      </g>
    ),
  },
  solana: {
    bg: "#000000",
    mark: (
      <g>
        <path d="M10.6 7.8H24.2L21.4 11.4H7.8Z" fill="#00FFA3" />
        <path d="M7.8 14.2H21.4L24.2 17.8H10.6Z" fill="#8752F3" />
        <path d="M10.6 20.6H24.2L21.4 24.2H7.8Z" fill="#DC1FFF" />
      </g>
    ),
  },

  // ---------- Exchanges ----------
  binance: { bg: "#181A20", mark: BINANCE_MARK("#F0B90B") },
  okx: { bg: "#000000", mark: OKX_MARK },
  bybit: { bg: "#15192A", mark: letter("B", "#F7A600") },
  coinbase: { bg: "#0052FF", mark: COINBASE_MARK },
  kraken: { bg: "#7132F5", mark: letter("K") },
  bitget: { bg: "#0F1320", mark: letter("B", "#00E2EE") },
  kucoin: { bg: "#23AF91", mark: letter("K") },
  gateio: {
    bg: "#E6483D",
    mark: (
      <g>
        <path
          d="M16 7.2a8.8 8.8 0 1 0 8.8 8.8"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="4.4"
        />
        <rect x="16" y="11.6" width="8.8" height="8.8" fill="#FFFFFF" opacity="0.45" />
      </g>
    ),
  },
  htx: { bg: "#1F6FEB", mark: letter("H") },
  mexc: { bg: "#1972F5", mark: letter("M") },
  cryptocom: {
    bg: "#002D74",
    mark: (
      <g>
        <path
          d="M16 5.5L25 8.9V16.4C25 21.6 21.2 25.3 16 26.9C10.8 25.3 7 21.6 7 16.4V8.9Z"
          fill="#FFFFFF"
        />
        <rect x="14.8" y="11.5" width="2.4" height="7.5" fill="#002D74" />
      </g>
    ),
  },
  bingx: { bg: "#2354E6", mark: letter("X") },
  bitfinex: {
    bg: "#152330",
    mark: (
      <path
        d="M7.5 22.5C9 12.5 17.5 7 25.5 8.2C23.8 17.5 15.6 23.8 7.5 22.5Z"
        fill="#03CA9B"
      />
    ),
  },
  gemini: {
    bg: "#00DCFA",
    mark: (
      <g fill="none" stroke="#FFFFFF" strokeWidth="2.7" strokeLinecap="round">
        <path d="M9 14.2a7.1 7.1 0 0 1 14 0" />
        <path d="M23 17.8a7.1 7.1 0 0 1 -14 0" />
      </g>
    ),
  },
  bitstamp: {
    bg: "#149F5B",
    mark: (
      <path
        d="M16 6C16 6 9.2 14.3 9.2 18.9a6.8 6.8 0 0 0 13.6 0C22.8 14.3 16 6 16 6Z"
        fill="#FFFFFF"
      />
    ),
  },
  upbit: { bg: "#093687", mark: letter("U") },

  // ---------- Wallet apps ----------
  metamask: {
    bg: "#FFFFFF",
    mark: (
      <g>
        <path
          d="M6.2 7.5L14.2 12.6L16 12.2L17.8 12.6L25.8 7.5L24.4 14.4L25.4 17.4L21.4 23.6L17.4 21.7H14.6L10.6 23.6L6.6 17.4L7.6 14.4Z"
          fill="#F6851B"
        />
        <path d="M14.4 21.7L16 19.6L17.6 21.7L16 24.4Z" fill="#763D16" />
      </g>
    ),
  },
  phantom: {
    bg: "#AB9FF2",
    mark: (
      <g>
        <path
          d="M7 16.8a9 9 0 0 1 18 0c0 3.4-2 6-4.8 6c-1.6 0-2.1-1-3.2-1s-1.6 1-3.2 1C11 22.8 7 20.2 7 16.8Z"
          fill="#FFFFFF"
        />
        <circle cx="13" cy="15.2" r="1.3" fill="#AB9FF2" />
        <circle cx="19" cy="15.2" r="1.3" fill="#AB9FF2" />
      </g>
    ),
  },
  rabby: {
    bg: "#7084FF",
    mark: (
      <g fill="#FFFFFF">
        <ellipse cx="12.6" cy="10.8" rx="2" ry="4.6" transform="rotate(-14 12.6 10.8)" />
        <ellipse cx="19.4" cy="10.8" rx="2" ry="4.6" transform="rotate(14 19.4 10.8)" />
        <circle cx="16" cy="18.6" r="6.4" />
      </g>
    ),
  },
  trust: {
    bg: "#0500FF",
    mark: (
      <path
        d="M16 6L24.8 9.1C24.8 17.3 21.9 23.4 16 26.4C10.1 23.4 7.2 17.3 7.2 9.1Z"
        fill="#FFFFFF"
      />
    ),
  },
  rainbow: {
    bg: "#001E59",
    mark: (
      <g fill="none" strokeLinecap="round">
        <path d="M9.5 11A12 12 0 0 1 21.5 23" stroke="#FF4000" strokeWidth="2.6" />
        <path d="M9.5 15A8 8 0 0 1 17.5 23" stroke="#FFD641" strokeWidth="2.6" />
        <path d="M9.5 19A4 4 0 0 1 13.5 23" stroke="#00D4FF" strokeWidth="2.6" />
        <circle cx="9.7" cy="22.8" r="1.5" fill="#FFFFFF" />
      </g>
    ),
  },
  backpack: {
    bg: "#E33E3F",
    mark: (
      <g>
        <rect x="10" y="11" width="12" height="13.5" rx="3" fill="#FFFFFF" />
        <path
          d="M13 11V9.8a3 3 0 0 1 6 0V11"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="2.2"
        />
        <rect x="13.4" y="16.4" width="5.2" height="4.2" rx="1.2" fill="#E33E3F" />
      </g>
    ),
  },
  ledger: {
    bg: "#000000",
    mark: (
      <g fill="#FFFFFF">
        <path d="M7 7H15.2V9.7H9.7V15.2H7Z" />
        <rect x="16.4" y="16.4" width="8.6" height="8.6" />
      </g>
    ),
  },
  safe: {
    bg: "#12FF80",
    mark: (
      <g fill="#121312">
        <path
          fillRule="evenodd"
          d="M16 6.5L24.4 9.5C24.4 17.2 21.6 22.9 16 25.8C10.4 22.9 7.6 17.2 7.6 9.5ZM16 9.3L10.2 11.4C10.4 17 12.4 21 16 23.2C19.6 21 21.6 17 21.8 11.4Z"
        />
        <circle cx="16" cy="15.8" r="2.4" />
      </g>
    ),
  },
  keplr: { bg: "#6259FF", mark: letter("K") },
};

/** Wallet-brand ids that visually reuse another id's mark. */
const ALIASES: Record<string, string> = {
  "coinbase-wallet": "coinbase",
  "okx-wallet": "okx",
  "bitget-wallet": "bitget",
};

function lookupFallback(id: string): LogoDef {
  const reg =
    getWalletBrand(id) ?? CHAIN_BRANDS[id] ?? EXCHANGE_BRANDS[id] ?? null;
  return {
    bg: reg?.color ?? "#374151",
    mark: letter(reg?.monogram ?? (id.charAt(0) || "?").toUpperCase()),
  };
}

export interface BrandLogoProps {
  /** Exchange id, chain id, or wallet-brand id (shared id space). */
  id: string;
  /** Tile size in px. */
  size?: number;
  className?: string;
  /** Tile corner rounding (defaults to the app-icon look). */
  rounded?: boolean;
}

export function BrandLogo({ id, size = 28, className, rounded = true }: BrandLogoProps) {
  const def = LOGOS[ALIASES[id] ?? id] ?? lookupFallback(id);
  // White tiles (MetaMask) need a hairline so they don't dissolve into the page.
  const needsBorder = def.bg.toUpperCase() === "#FFFFFF";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      className={className}
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      <rect
        width="32"
        height="32"
        rx={rounded ? 7 : 0}
        fill={def.bg}
        stroke={needsBorder ? "rgba(0,0,0,0.12)" : "none"}
        strokeWidth={needsBorder ? 1 : 0}
      />
      {def.mark}
    </svg>
  );
}

/** Ids that have a hand-drawn mark (used by callers that want to filter). */
export function hasBrandLogo(id: string): boolean {
  return (ALIASES[id] ?? id) in LOGOS;
}
