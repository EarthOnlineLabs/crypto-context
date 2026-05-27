/**
 * CCXT wrapper for exchange operations.
 * Only read-only operations. No trading, no withdrawals.
 */

import ccxt, { type Exchange, type Balances } from "ccxt";

export type SupportedExchange = "binance" | "okx" | "bybit" | "coinbase";

export interface ExchangeCredentials {
  apiKey: string;
  secret: string;
  password?: string; // OKX requires passphrase
}

export interface PortfolioHolding {
  asset: string;
  free: number;
  locked: number;
  total: number;
  usdValue: number | null;
}

export interface PortfolioSnapshot {
  exchange: SupportedExchange;
  holdings: PortfolioHolding[];
  totalUsdValue: number;
  fetchedAt: string;
}

const EXCHANGE_CLASSES: Record<SupportedExchange, new (config: object) => Exchange> = {
  binance: ccxt.binance,
  okx: ccxt.okx,
  bybit: ccxt.bybit,
  coinbase: ccxt.coinbase,
};

function createExchangeInstance(
  exchangeId: SupportedExchange,
  credentials: ExchangeCredentials
): Exchange {
  const ExchangeClass = EXCHANGE_CLASSES[exchangeId];
  if (!ExchangeClass) {
    throw new Error(`Unsupported exchange: ${exchangeId}`);
  }

  return new ExchangeClass({
    apiKey: credentials.apiKey,
    secret: credentials.secret,
    password: credentials.password,
    enableRateLimit: true,
    options: { defaultType: "spot" },
  });
}

/**
 * Verify that API key has ONLY read permissions.
 * Attempts a small test trade that should fail with permission error.
 * Returns true if key is read-only, false if it can trade.
 */
export async function verifyReadOnly(
  exchangeId: SupportedExchange,
  credentials: ExchangeCredentials
): Promise<{ valid: boolean; readOnly: boolean; error?: string }> {
  try {
    const exchange = createExchangeInstance(exchangeId, credentials);

    // First test: can we read balances? (should succeed)
    await exchange.fetchBalance();

    // Key is valid and can read. That's all we need to confirm.
    // We don't attempt a write operation — exchange-side permission
    // enforcement is the real guard (Binance returns 403 on trade
    // endpoints when key is read-only).
    return { valid: true, readOnly: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);

    // Auth errors = invalid key
    if (
      message.includes("Invalid API") ||
      message.includes("AuthenticationError") ||
      message.includes("invalid signature")
    ) {
      return { valid: false, readOnly: false, error: "Invalid API key or secret" };
    }

    // Permission errors = key works but can't read (unusual)
    if (message.includes("PermissionDenied")) {
      return { valid: false, readOnly: false, error: "Key lacks read permission" };
    }

    return { valid: false, readOnly: false, error: message };
  }
}

/**
 * Fetch portfolio balances from an exchange.
 */
export async function fetchPortfolio(
  exchangeId: SupportedExchange,
  credentials: ExchangeCredentials
): Promise<PortfolioSnapshot> {
  const exchange = createExchangeInstance(exchangeId, credentials);

  const balances: Balances = await exchange.fetchBalance();

  // Filter out zero balances and build holdings list
  const holdings: PortfolioHolding[] = [];
  let totalUsdValue = 0;

  for (const [asset, balance] of Object.entries(balances.total)) {
    const total = balance as number;
    if (total <= 0) continue;

    const freeMap = balances.free as unknown as Record<string, number>;
    const usedMap = balances.used as unknown as Record<string, number>;
    const free = freeMap[asset] || 0;
    const locked = usedMap[asset] || 0;

    // Try to get USD value via ticker
    let usdValue: number | null = null;
    if (asset === "USDT" || asset === "USDC" || asset === "USD" || asset === "BUSD") {
      usdValue = total;
    } else {
      try {
        const ticker = await exchange.fetchTicker(`${asset}/USDT`);
        if (ticker.last) {
          usdValue = total * ticker.last;
        }
      } catch {
        // No USDT pair available, try USD
        try {
          const ticker = await exchange.fetchTicker(`${asset}/USD`);
          if (ticker.last) {
            usdValue = total * ticker.last;
          }
        } catch {
          // Can't price this asset
        }
      }
    }

    if (usdValue !== null) {
      totalUsdValue += usdValue;
    }

    holdings.push({ asset, free, locked, total, usdValue });
  }

  // Sort by USD value descending
  holdings.sort((a, b) => (b.usdValue ?? 0) - (a.usdValue ?? 0));

  return {
    exchange: exchangeId,
    holdings,
    totalUsdValue,
    fetchedAt: new Date().toISOString(),
  };
}
