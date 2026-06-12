import type { TradeRecord, OrderRecord, FetchQuality } from "../exchange-history";

/** Quote currencies treated as ≈ USD for aggregation. */
const USD_QUOTES = new Set(["USDT", "USDC", "USD", "BUSD", "FDUSD", "DAI", "TUSD", "PYUSD", "USDE"]);

interface PairStats {
  symbol: string;
  quote: string;
  tradeCount: number;
  buyCount: number;
  sellCount: number;
  totalVolume: number;
  buyVolume: number;
  sellVolume: number;
}

interface TradingAnalysis {
  tradeCount: number;
  dateRange: { from: string; to: string } | null;
  tradesPerWeek: number;
  uniquePairs: number;
  pairStats: PairStats[];
  buyCount: number;
  sellCount: number;
  /** USD-stable-quoted trades only — never mixes quote units. */
  usd: {
    tradeCount: number;
    buyVolume: number;
    sellVolume: number;
    avgTradeSize: number;
    medianTradeSize: number;
    maxTradeSize: number;
  };
  /** Volume per non-USD quote currency (e.g. BTC/ETH-quoted or KRW pairs). */
  otherQuoteVolumes: Array<{ quote: string; volume: number }>;
  limitOrderRatio: number;
  /** Fees grouped by fee currency — fee units must never be summed together. */
  feesByCurrency: Array<{ currency: string; amount: number }>;
  recentTrades: TradeRecord[];
  openOrders: OrderRecord[];
  dcaAssets: string[];
}

function formatUsd(value: number): string {
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}k`;
  return `$${value.toFixed(0)}`;
}

function formatQty(value: number): string {
  return value.toLocaleString("en-US", { maximumFractionDigits: 6 });
}

function formatDate(ts: number): string {
  return new Date(ts).toISOString().slice(0, 10);
}

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

function quoteOf(symbol: string): string {
  return symbol.split("/")[1] ?? "";
}

function detectDCA(trades: TradeRecord[]): string[] {
  const buysBySymbol = new Map<string, number[]>();
  for (const t of trades) {
    if (t.side !== "buy") continue;
    const existing = buysBySymbol.get(t.symbol) ?? [];
    existing.push(t.timestamp);
    buysBySymbol.set(t.symbol, existing);
  }

  const dcaAssets: string[] = [];
  const DAY_MS = 24 * 60 * 60 * 1000;

  for (const [symbol, timestamps] of buysBySymbol) {
    if (timestamps.length < 4) continue;
    const sorted = [...timestamps].sort((a, b) => a - b);
    const intervals = sorted.slice(1).map((t, i) => (t - sorted[i]) / DAY_MS);
    const med = median(intervals);

    const regularPeriods = [7, 14, 30];
    for (const period of regularPeriods) {
      if (Math.abs(med - period) / period < 0.25) {
        dcaAssets.push(symbol.split("/")[0]);
        break;
      }
    }
  }

  return dcaAssets;
}

function analyze(
  trades: TradeRecord[],
  closedOrders: OrderRecord[],
  openOrders: OrderRecord[],
): TradingAnalysis {
  const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
  const now = Date.now();
  const recentTrades = trades.filter((t) => t.timestamp > now - SEVEN_DAYS);

  if (trades.length === 0) {
    return {
      tradeCount: 0,
      dateRange: null,
      tradesPerWeek: 0,
      uniquePairs: 0,
      pairStats: [],
      buyCount: 0,
      sellCount: 0,
      usd: { tradeCount: 0, buyVolume: 0, sellVolume: 0, avgTradeSize: 0, medianTradeSize: 0, maxTradeSize: 0 },
      otherQuoteVolumes: [],
      limitOrderRatio: 0,
      feesByCurrency: [],
      recentTrades,
      openOrders,
      dcaAssets: [],
    };
  }

  const first = trades[0].timestamp;
  const last = trades[trades.length - 1].timestamp;
  const spanWeeks = Math.max((last - first) / (7 * 24 * 60 * 60 * 1000), 1);

  const pairMap = new Map<string, PairStats>();
  const feeMap = new Map<string, number>();
  const otherQuoteMap = new Map<string, number>();
  let buyCount = 0;
  let sellCount = 0;
  let usdBuyVolume = 0;
  let usdSellVolume = 0;
  const usdTradeSizes: number[] = [];

  for (const t of trades) {
    const quote = quoteOf(t.symbol);
    const isUsdQuote = USD_QUOTES.has(quote.toUpperCase());

    const stats = pairMap.get(t.symbol) ?? {
      symbol: t.symbol,
      quote,
      tradeCount: 0,
      buyCount: 0,
      sellCount: 0,
      totalVolume: 0,
      buyVolume: 0,
      sellVolume: 0,
    };

    stats.tradeCount++;
    stats.totalVolume += t.cost;

    if (t.fee > 0) {
      const cur = t.feeCurrency || "unknown";
      feeMap.set(cur, (feeMap.get(cur) ?? 0) + t.fee);
    }

    if (isUsdQuote) {
      usdTradeSizes.push(t.cost);
    } else {
      otherQuoteMap.set(quote, (otherQuoteMap.get(quote) ?? 0) + t.cost);
    }

    if (t.side === "buy") {
      buyCount++;
      stats.buyCount++;
      stats.buyVolume += t.cost;
      if (isUsdQuote) usdBuyVolume += t.cost;
    } else {
      sellCount++;
      stats.sellCount++;
      stats.sellVolume += t.cost;
      if (isUsdQuote) usdSellVolume += t.cost;
    }

    pairMap.set(t.symbol, stats);
  }

  const pairStats = Array.from(pairMap.values()).sort(
    (a, b) => b.tradeCount - a.tradeCount || b.totalVolume - a.totalVolume,
  );

  const limitOrders = closedOrders.filter((o) => o.type === "limit").length;
  const limitOrderRatio =
    closedOrders.length > 0 ? limitOrders / closedOrders.length : 0;

  return {
    tradeCount: trades.length,
    dateRange: { from: formatDate(first), to: formatDate(last) },
    tradesPerWeek: trades.length / spanWeeks,
    uniquePairs: pairStats.length,
    pairStats,
    buyCount,
    sellCount,
    usd: {
      tradeCount: usdTradeSizes.length,
      buyVolume: usdBuyVolume,
      sellVolume: usdSellVolume,
      avgTradeSize:
        usdTradeSizes.length > 0
          ? usdTradeSizes.reduce((a, b) => a + b, 0) / usdTradeSizes.length
          : 0,
      medianTradeSize: median(usdTradeSizes),
      maxTradeSize: usdTradeSizes.length > 0 ? Math.max(...usdTradeSizes) : 0,
    },
    otherQuoteVolumes: Array.from(otherQuoteMap.entries()).map(([quote, volume]) => ({ quote, volume })),
    limitOrderRatio,
    feesByCurrency: Array.from(feeMap.entries())
      .map(([currency, amount]) => ({ currency, amount }))
      .sort((a, b) => b.amount - a.amount),
    recentTrades,
    openOrders,
    dcaAssets: detectDCA(trades),
  };
}

/** Volume for one pair is always in that pair's quote currency — label it honestly. */
function formatPairVolume(p: PairStats): string {
  return USD_QUOTES.has(p.quote.toUpperCase())
    ? formatUsd(p.totalVolume)
    : `${formatQty(p.totalVolume)} ${p.quote}`;
}

export function generateTradingProfile(
  trades: TradeRecord[],
  closedOrders: OrderRecord[],
  openOrders: OrderRecord[],
  exchangeName: string,
  quality?: FetchQuality,
): { markdown: string; metadata: Record<string, unknown> } {
  const a = analyze(trades, closedOrders, openOrders);
  const lines: string[] = [];

  lines.push(`# Trading Profile — ${exchangeName}`);

  if (quality && !quality.supported) {
    lines.push("> This exchange's API does not expose trade history — trading activity can't be analyzed here.");
    return {
      markdown: lines.join("\n"),
      metadata: { tradeCount: 0, hasOpenOrders: openOrders.length > 0, dataStatus: "unsupported" },
    };
  }

  if (a.tradeCount === 0 && a.openOrders.length === 0) {
    if (quality?.error) {
      lines.push("> Trade history could not be retrieved (fetch failed). Absence of trades here does NOT mean the account is inactive.");
      return {
        markdown: lines.join("\n"),
        metadata: { tradeCount: 0, hasOpenOrders: false, dataStatus: "error" },
      };
    }
    lines.push("> No trading activity found in the last 90 days.");
    lines.push("");
    lines.push("This account appears to be used primarily for holding, not active trading.");
    return {
      markdown: lines.join("\n"),
      metadata: { tradeCount: 0, hasOpenOrders: false, dataStatus: "empty" },
    };
  }

  const partial = !!quality && (!!quality.error || !quality.complete);

  if (a.tradeCount > 0 && a.dateRange) {
    lines.push(`> Based on ${a.tradeCount} trades (${a.dateRange.from} to ${a.dateRange.to}, 90-day window)`);
    if (partial) {
      lines.push("> Note: history fetch was incomplete — figures are lower bounds, not totals.");
    }
    lines.push("");

    // Activity Summary
    lines.push("## Activity Summary");
    lines.push(`- Trades per week: ${a.tradesPerWeek.toFixed(1)}`);
    lines.push(`- Unique pairs traded: ${a.uniquePairs}`);
    if (a.usd.tradeCount > 0) {
      lines.push(`- Total volume: ${formatUsd(a.usd.buyVolume + a.usd.sellVolume)}${a.otherQuoteVolumes.length > 0 ? " (USD-quoted pairs)" : ""}`);
    }
    for (const v of a.otherQuoteVolumes) {
      lines.push(`- Volume in ${v.quote}-quoted pairs: ${formatQty(v.volume)} ${v.quote}`);
    }
    if (a.feesByCurrency.length > 0) {
      const feeStr = a.feesByCurrency
        .slice(0, 4)
        .map((f) => `${formatQty(f.amount)} ${f.currency}`)
        .join(" + ");
      lines.push(`- Fees paid: ${feeStr}`);
    }
    lines.push("");

    // Top Traded Pairs
    if (a.pairStats.length > 0) {
      lines.push("## Top Traded Pairs");
      lines.push("| Pair | Trades | Volume | Buy/Sell |");
      lines.push("|------|--------|--------|----------|");
      for (const p of a.pairStats.slice(0, 10)) {
        const buySell = `${p.buyCount}/${p.sellCount}`;
        lines.push(
          `| ${p.symbol} | ${p.tradeCount} | ${formatPairVolume(p)} | ${buySell} |`,
        );
      }
      lines.push("");
    }

    // Trading Patterns
    lines.push("## Trading Patterns");
    const netBias =
      a.usd.tradeCount > 0
        ? a.usd.buyVolume > a.usd.sellVolume * 1.2
          ? "net accumulator"
          : a.usd.sellVolume > a.usd.buyVolume * 1.2
            ? "net distributor"
            : "balanced"
        : a.buyCount > a.sellCount * 1.5
          ? "mostly buying"
          : a.sellCount > a.buyCount * 1.5
            ? "mostly selling"
            : "balanced";
    lines.push(`- Buy/Sell ratio: ${a.buyCount}/${a.sellCount} (${netBias})`);
    if (a.usd.tradeCount > 0) {
      const scope = a.otherQuoteVolumes.length > 0 ? " (USD-quoted pairs)" : "";
      lines.push(`- Buy volume: ${formatUsd(a.usd.buyVolume)} | Sell volume: ${formatUsd(a.usd.sellVolume)}${scope}`);
      lines.push(`- Avg trade size: ${formatUsd(a.usd.avgTradeSize)}`);
      lines.push(`- Median trade size: ${formatUsd(a.usd.medianTradeSize)}`);
      lines.push(`- Max trade size: ${formatUsd(a.usd.maxTradeSize)}`);
    }
    if (a.limitOrderRatio > 0) {
      lines.push(`- Limit order usage: ${(a.limitOrderRatio * 100).toFixed(0)}%`);
    }
    if (a.dcaAssets.length > 0) {
      lines.push(`- DCA detected: ${a.dcaAssets.join(", ")} (regular recurring buys)`);
    }
    lines.push("");

    // Recent Activity
    if (a.recentTrades.length > 0) {
      lines.push("## Recent Activity (Last 7 Days)");
      lines.push(`- ${a.recentTrades.length} trades executed`);
      const recentBuys = a.recentTrades.filter((t) => t.side === "buy");
      const recentSells = a.recentTrades.filter((t) => t.side === "sell");
      if (recentBuys.length > 0) {
        const assets = [...new Set(recentBuys.map((t) => t.symbol.split("/")[0]))];
        lines.push(`- Bought: ${assets.join(", ")}`);
      }
      if (recentSells.length > 0) {
        const assets = [...new Set(recentSells.map((t) => t.symbol.split("/")[0]))];
        lines.push(`- Sold: ${assets.join(", ")}`);
      }
      lines.push("");
    }
  }

  // Open Orders
  if (a.openOrders.length > 0) {
    lines.push("## Open Orders");
    lines.push("| Pair | Side | Type | Price | Amount |");
    lines.push("|------|------|------|-------|--------|");
    for (const o of a.openOrders) {
      lines.push(
        `| ${o.symbol} | ${o.side} | ${o.type} | $${o.price.toFixed(2)} | ${o.amount} |`,
      );
    }
    lines.push("");
  }

  return {
    markdown: lines.join("\n"),
    metadata: {
      tradeCount: a.tradeCount,
      dateRange: a.dateRange,
      uniquePairs: a.uniquePairs,
      tradesPerWeek: Math.round(a.tradesPerWeek * 10) / 10,
      hasOpenOrders: a.openOrders.length > 0,
      dataStatus: partial ? "partial" : "ok",
    },
  };
}
