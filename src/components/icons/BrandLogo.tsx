/**
 * Brand logo tiles for exchanges, chains and wallet apps — REAL logos only.
 *
 * Every mark is the brand's authentic asset, bundled locally in /public/brands
 * (sources: CoinGecko's official venue logos; each wallet project's own GitHub
 * avatar; native-token logos for chains). We never redraw third-party marks —
 * an approximated logo reads as counterfeit and costs more trust than no logo.
 * Unknown ids fall back to a branded monogram tile from the registry.
 */

import Image from "next/image";
import {
  getWalletBrand,
  CHAIN_BRANDS,
  EXCHANGE_BRANDS,
} from "@/lib/wallets/brands";
import { BRAND_IMAGE_IDS } from "@/lib/brand-assets";

/** Wallet-brand ids that share another id's logo (same company mark). */
const ALIASES: Record<string, string> = {
  "coinbase-wallet": "coinbase",
  "okx-wallet": "okx",
  "bitget-wallet": "bitget",
};

function fallbackStyle(id: string): { bg: string; monogram: string } {
  const reg = getWalletBrand(id) ?? CHAIN_BRANDS[id] ?? EXCHANGE_BRANDS[id] ?? null;
  return {
    bg: reg?.color ?? "#374151",
    monogram: reg?.monogram ?? (id.charAt(0) || "?").toUpperCase(),
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
  const resolved = ALIASES[id] ?? id;
  const radius = rounded ? Math.max(3, Math.round(size * 0.22)) : 0;

  if (BRAND_IMAGE_IDS.has(resolved)) {
    // White tile + inset keeps mixed asset shapes (dark app icons, transparent
    // token marks, square avatars) visually uniform, like a wallet-connect tray.
    const inset = Math.max(1, Math.round(size * 0.09));
    return (
      <span
        className={`inline-flex items-center justify-center bg-white ring-1 ring-inset ring-black/10 ${className ?? ""}`}
        style={{ width: size, height: size, borderRadius: radius, padding: inset, flexShrink: 0 }}
        aria-hidden="true"
      >
        <Image
          src={`/brands/${resolved}.png`}
          alt=""
          width={size - inset * 2}
          height={size - inset * 2}
          unoptimized
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            borderRadius: Math.max(2, Math.round(radius * 0.55)),
          }}
        />
      </span>
    );
  }

  const fb = fallbackStyle(resolved);
  return (
    <span
      className={`inline-flex items-center justify-center font-bold text-white ${className ?? ""}`}
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        backgroundColor: fb.bg,
        fontSize: Math.round(size * 0.48),
        flexShrink: 0,
      }}
      aria-hidden="true"
    >
      {fb.monogram}
    </span>
  );
}

/** Whether a real bundled logo exists for this id. */
export function hasBrandLogo(id: string): boolean {
  return BRAND_IMAGE_IDS.has(ALIASES[id] ?? id);
}
