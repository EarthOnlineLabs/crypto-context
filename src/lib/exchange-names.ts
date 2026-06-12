/**
 * Display names for supported exchanges. Client-safe (no ccxt import) — used by
 * dashboard components; the authoritative id list lives in lib/exchange.ts.
 */

export const EXCHANGE_DISPLAY_NAMES: Record<string, string> = {
  binance: "Binance",
  okx: "OKX",
  bybit: "Bybit",
  coinbase: "Coinbase",
  kraken: "Kraken",
  bitget: "Bitget",
  kucoin: "KuCoin",
  gateio: "Gate.io",
  htx: "HTX",
  mexc: "MEXC",
  cryptocom: "Crypto.com",
  bingx: "BingX",
  bitfinex: "Bitfinex",
  gemini: "Gemini",
  bitstamp: "Bitstamp",
  upbit: "Upbit",
};

export function exchangeDisplayName(id: string | null | undefined): string {
  if (!id) return "Exchange";
  return EXCHANGE_DISPLAY_NAMES[id] ?? id.charAt(0).toUpperCase() + id.slice(1);
}

/** The connect form's option list, derived from the same map. */
export const EXCHANGE_OPTIONS = Object.entries(EXCHANGE_DISPLAY_NAMES).map(([id, name]) => ({
  id,
  name,
}));
