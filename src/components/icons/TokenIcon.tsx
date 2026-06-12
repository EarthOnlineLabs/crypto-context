/**
 * Token (coin) icon — the asset's REAL logo, bundled locally in /public/tokens
 * (official project logos via CoinGecko's asset CDN; top assets by market cap
 * plus the exchange platform tokens our users realistically hold).
 *
 * Unknown symbols fall back to a neutral letter disc, never a redrawn mark.
 */

import Image from "next/image";
import { TOKEN_IMAGE_SYMBOLS } from "@/lib/brand-assets";

export interface TokenIconProps {
  /** Asset symbol as it appears in holdings (e.g. "BTC", "BGB"). */
  symbol: string;
  /** Icon size in px. */
  size?: number;
  className?: string;
}

export function TokenIcon({ symbol, size = 28, className }: TokenIconProps) {
  const sym = symbol.toLowerCase();

  if (TOKEN_IMAGE_SYMBOLS.has(sym)) {
    return (
      <Image
        src={`/tokens/${sym}.png`}
        alt=""
        width={size}
        height={size}
        unoptimized
        className={`rounded-full ${className ?? ""}`}
        style={{ width: size, height: size, flexShrink: 0 }}
        aria-hidden="true"
      />
    );
  }

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full bg-gray-100 font-bold text-gray-500 ${className ?? ""}`}
      style={{ width: size, height: size, fontSize: Math.max(8, Math.round(size * 0.3)), flexShrink: 0 }}
      aria-hidden="true"
    >
      {symbol.slice(0, 3).toUpperCase()}
    </span>
  );
}
