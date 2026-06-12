/**
 * Bundled real-logo manifest — generated from the assets in /public.
 *
 * Sources (authoritative, never hand-drawn — see tasks/lessons.md):
 * - Exchanges + tokens: CoinGecko asset CDN (official venue/project logos)
 * - Wallet apps: each project's own GitHub organization avatar
 * - Chains: the native token's logo by convention; Base from base-org
 *
 * Regenerate by re-running the download (see git history) and updating these
 * lists to match the files actually present in public/brands + public/tokens.
 */

/** Ids with a real logo at /brands/{id}.png (exchanges, chains, wallet apps). */
export const BRAND_IMAGE_IDS: ReadonlySet<string> = new Set([
  "arbitrum", "avalanche", "backpack", "base", "binance", "bingx", "bitfinex", "bitget",
  "bitstamp", "bsc", "bybit", "coinbase", "cryptocom", "ethereum", "gateio", "gemini",
  "htx", "kraken", "kucoin", "ledger", "metamask", "mexc", "okx", "optimism",
  "phantom", "polygon", "rabby", "rainbow", "safe", "solana", "trust", "upbit",
]);

/** Lowercase symbols with a real logo at /tokens/{symbol}.png. */
export const TOKEN_IMAGE_SYMBOLS: ReadonlySet<string> = new Set([
  "9bit", "a7a5", "aave", "ada", "adi", "aero", "algo", "apt",
  "apxusd", "arb", "aster", "atom", "avax", "bcap", "bch", "bdx",
  "beat", "bfusd", "bgb", "bnb", "bonk", "btc", "btt", "buidl",
  "cake", "cc", "chz", "cro", "crv", "dai", "dash", "dexe",
  "doge", "dot", "ena", "etc", "eth", "ethfi", "eurc", "eursafo",
  "eutbl", "fdusd", "fet", "figr_heloc", "fil", "flr", "gho", "gno",
  "gt", "gwei", "h", "hash", "hbar", "htx", "hype", "icp",
  "inj", "jaaa", "jst", "jto", "jtrsy", "jup", "kag", "kas",
  "kau", "kcs", "kite", "lab", "leo", "link", "lit", "ltc",
  "lunc", "m", "mnt", "mon", "morpho", "near", "nexo", "nft",
  "night", "ohm", "okb", "ondo", "op", "ousg", "paxg", "pengu",
  "pepe", "pi", "pol", "prime", "pump", "pyth", "pyusd", "qnt",
  "rain", "render", "rlusd", "rusd", "sei", "shib", "siren", "sky",
  "skyai", "sol", "spx", "stable", "stx", "sui", "sun", "tao",
  "tia", "ton", "trump", "trx", "tusd", "u", "ub", "uni",
  "usd0", "usd1", "usdc", "usdd", "usde", "usdf", "usdg", "usds",
  "usdt", "usdtb", "usdy", "ustb", "usx", "usyc", "velvet", "vet",
  "virtual", "vvv", "wbt", "wld", "wlfi", "xaut", "xdc", "xlm",
  "xmr", "xrp", "xtz", "ylds", "zbcn", "zec", "币安人生",
]);
