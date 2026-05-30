/**
 * Brand registry for wallets, chains and exchanges.
 *
 * Drives the "instantly identifiable" connection badges in the dashboard: a
 * soft brand-tinted square with a legible monogram, plus the canonical display
 * name. Pure data + colour helpers — no runtime deps, safe on client & server.
 *
 * Upgrade path: each entry can later carry an optional `logo` (a bundled SVG in
 * `public/brands/`) and the badge can render that instead of the monogram. The
 * call sites already resolve through here, so swapping in real logos is a
 * registry-only change.
 */

export interface BrandStyle {
  /** Stable id persisted on the wallet row / derived from exchange or chain. */
  id: string;
  /** Canonical display name. */
  name: string;
  /** Signature brand colour (hex). Tinted for the badge background. */
  color: string;
  /** 1-char monogram shown in the badge. */
  monogram: string;
}

/** Self-custody wallet apps offered in the connect form's optional picker. */
export const WALLET_BRANDS: BrandStyle[] = [
  { id: "metamask", name: "MetaMask", color: "#F6851B", monogram: "M" },
  { id: "phantom", name: "Phantom", color: "#AB9FF2", monogram: "P" },
  { id: "rabby", name: "Rabby", color: "#7084FF", monogram: "R" },
  { id: "coinbase", name: "Coinbase Wallet", color: "#0052FF", monogram: "C" },
  { id: "trust", name: "Trust Wallet", color: "#3375BB", monogram: "T" },
  { id: "okx", name: "OKX Wallet", color: "#1A1A1A", monogram: "O" },
  { id: "rainbow", name: "Rainbow", color: "#FF5CAA", monogram: "R" },
  { id: "bitget", name: "Bitget Wallet", color: "#00B4D8", monogram: "B" },
  { id: "backpack", name: "Backpack", color: "#E33E3F", monogram: "B" },
  { id: "keplr", name: "Keplr", color: "#6259FF", monogram: "K" },
  { id: "ledger", name: "Ledger", color: "#1A1A1A", monogram: "L" },
  { id: "safe", name: "Safe", color: "#12FF80", monogram: "S" },
];

/** Chain identity, used for the badge when no wallet brand was chosen. */
export const CHAIN_BRANDS: Record<string, BrandStyle> = {
  ethereum: { id: "ethereum", name: "Ethereum", color: "#627EEA", monogram: "E" },
  solana: { id: "solana", name: "Solana", color: "#9945FF", monogram: "S" },
  bsc: { id: "bsc", name: "BNB Chain", color: "#D9A200", monogram: "B" },
  polygon: { id: "polygon", name: "Polygon", color: "#8247E5", monogram: "P" },
  arbitrum: { id: "arbitrum", name: "Arbitrum", color: "#2D9CDB", monogram: "A" },
  base: { id: "base", name: "Base", color: "#0052FF", monogram: "B" },
  optimism: { id: "optimism", name: "Optimism", color: "#FF0420", monogram: "O" },
  avalanche: { id: "avalanche", name: "Avalanche", color: "#E84142", monogram: "A" },
};

/** Exchange identity — the exchange id *is* the brand, so no extra column. */
export const EXCHANGE_BRANDS: Record<string, BrandStyle> = {
  binance: { id: "binance", name: "Binance", color: "#D9A200", monogram: "B" },
  okx: { id: "okx", name: "OKX", color: "#1A1A1A", monogram: "O" },
  bybit: { id: "bybit", name: "Bybit", color: "#E89D0C", monogram: "B" },
  coinbase: { id: "coinbase", name: "Coinbase", color: "#0052FF", monogram: "C" },
  kraken: { id: "kraken", name: "Kraken", color: "#5741D9", monogram: "K" },
  bitget: { id: "bitget", name: "Bitget", color: "#00B4D8", monogram: "B" },
  kucoin: { id: "kucoin", name: "KuCoin", color: "#01BC8D", monogram: "K" },
  gateio: { id: "gateio", name: "Gate.io", color: "#E6483D", monogram: "G" },
  htx: { id: "htx", name: "HTX", color: "#1F6FEB", monogram: "H" },
  mexc: { id: "mexc", name: "MEXC", color: "#1972F5", monogram: "M" },
  cryptocom: { id: "cryptocom", name: "Crypto.com", color: "#0A3F94", monogram: "C" },
  bingx: { id: "bingx", name: "BingX", color: "#2354E6", monogram: "B" },
  bitfinex: { id: "bitfinex", name: "Bitfinex", color: "#16B157", monogram: "B" },
  gemini: { id: "gemini", name: "Gemini", color: "#1BA2B4", monogram: "G" },
  bitstamp: { id: "bitstamp", name: "Bitstamp", color: "#179B5D", monogram: "B" },
  upbit: { id: "upbit", name: "Upbit", color: "#093687", monogram: "U" },
};

const FALLBACK_COLOR = "#6B7280"; // gray-500

/** Set of valid wallet-brand ids for server-side validation. */
export const WALLET_BRAND_IDS: ReadonlySet<string> = new Set(
  WALLET_BRANDS.map((b) => b.id)
);

export function getWalletBrand(id?: string | null): BrandStyle | null {
  if (!id) return null;
  return WALLET_BRANDS.find((b) => b.id === id) ?? null;
}

export function getChainBrand(chain: string): BrandStyle {
  return (
    CHAIN_BRANDS[chain] ?? {
      id: chain,
      name: chain.charAt(0).toUpperCase() + chain.slice(1),
      color: FALLBACK_COLOR,
      monogram: (chain.charAt(0) || "?").toUpperCase(),
    }
  );
}

export function getExchangeBrand(id: string): BrandStyle {
  return (
    EXCHANGE_BRANDS[id] ?? {
      id,
      name: id.charAt(0).toUpperCase() + id.slice(1),
      color: "#10B981", // emerald-500 fallback keeps unknowns on-brand
      monogram: (id.charAt(0) || "?").toUpperCase(),
    }
  );
}

/** Visual identity for a wallet: the chosen brand if any, else the chain. */
export function resolveWalletStyle(
  brand: string | null | undefined,
  chain: string
): BrandStyle {
  return getWalletBrand(brand) ?? getChainBrand(chain);
}

// ---------- Colour helpers (deterministic, no deps) ----------

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const int = parseInt(full, 16);
  return { r: (int >> 16) & 255, g: (int >> 8) & 255, b: int & 255 };
}

/** Soft tinted background for a badge (brand colour at low alpha). */
export function badgeBg(hex: string): string {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, 0.14)`;
}

/** Legible monogram colour: brand hue mixed ~22% toward black. */
export function badgeFg(hex: string): string {
  const { r, g, b } = hexToRgb(hex);
  const k = 0.78;
  return `rgb(${Math.round(r * k)}, ${Math.round(g * k)}, ${Math.round(b * k)})`;
}
