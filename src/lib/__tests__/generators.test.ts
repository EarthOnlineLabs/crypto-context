import { describe, expect, it } from "vitest";
import { generateFundFlow } from "../generators/fund-flow";
import { generateTradingProfile } from "../generators/trading-profile";
import type { TradeRecord, TransferRecord } from "../exchange-history";

const DAY = 24 * 60 * 60 * 1000;
const now = Date.now();

function transfer(partial: Partial<TransferRecord>): TransferRecord {
  return {
    id: "t1",
    timestamp: now - 10 * DAY,
    type: "deposit",
    currency: "USDT",
    amount: 100,
    fee: 0,
    status: "ok",
    txid: null,
    ...partial,
  };
}

function trade(partial: Partial<TradeRecord>): TradeRecord {
  return {
    id: "tr1",
    timestamp: now - 10 * DAY,
    symbol: "BTC/USDT",
    side: "buy",
    price: 100,
    amount: 1,
    cost: 100,
    fee: 0,
    feeCurrency: "",
    takerOrMaker: "taker",
    ...partial,
  };
}

describe("generateFundFlow", () => {
  it("never sums amounts across currencies (the 15,394.51 bug)", () => {
    // 2 USDT deposits (6,090 each) + 1 BGB deposit (3,213) used to render
    // "total 15,394.51 across currencies" — a unit-mixing, meaningless number.
    const transfers = [
      transfer({ id: "a", currency: "USDT", amount: 6090, timestamp: now - 30 * DAY }),
      transfer({ id: "b", currency: "USDT", amount: 6090.68, timestamp: now - 20 * DAY }),
      transfer({ id: "c", currency: "BGB", amount: 3213.83, timestamp: now - 10 * DAY }),
    ];
    const { markdown } = generateFundFlow(transfers, "bitget");
    expect(markdown).not.toContain("across currencies");
    expect(markdown).not.toContain("15,394");
    // Per-currency rows remain meaningful.
    expect(markdown).toContain("| USDT | 2x (12,180.68)");
    expect(markdown).toContain("| BGB | 1x (3,213.83)");
  });

  it("summarizes the most active currency with an explicit unit", () => {
    const transfers = [
      transfer({ id: "a", currency: "USDT", amount: 500, timestamp: now - 30 * DAY }),
      transfer({ id: "b", currency: "USDT", amount: 700, type: "withdrawal", timestamp: now - 20 * DAY }),
      transfer({ id: "c", currency: "BGB", amount: 10, timestamp: now - 10 * DAY }),
    ];
    const { markdown, metadata } = generateFundFlow(transfers, "bitget");
    expect(markdown).toContain("Most active currency: USDT — 1 in / 1 out, net -200 USDT");
    expect(metadata.primaryCurrency).toBe("USDT");
    expect(metadata.primaryNetFlow).toBe(-200);
  });

  it("distinguishes 'unsupported' from 'no activity'", () => {
    const { markdown, metadata } = generateFundFlow([], "gemini", {
      supported: false,
      complete: true,
      error: null,
    });
    expect(markdown).toContain("does not expose deposit/withdrawal history");
    expect(markdown).not.toContain("No deposit or withdrawal activity");
    expect(metadata.dataStatus).toBe("unsupported");
  });

  it("distinguishes 'fetch failed' from 'no activity'", () => {
    const { markdown, metadata } = generateFundFlow([], "binance", {
      supported: true,
      complete: false,
      error: "request timeout",
    });
    expect(markdown).toContain("could not be retrieved");
    expect(markdown).toContain("does NOT mean the account is inactive");
    expect(metadata.dataStatus).toBe("error");
  });

  it("marks partial fetches so figures read as lower bounds", () => {
    const transfers = [transfer({})];
    const { markdown, metadata } = generateFundFlow(transfers, "binance", {
      supported: true,
      complete: false,
      error: "time limit reached",
    });
    expect(markdown).toContain("lower bounds");
    expect(metadata.dataStatus).toBe("partial");
  });

  it("keeps the plain empty state when there is genuinely no activity", () => {
    const { markdown, metadata } = generateFundFlow([], "okx", {
      supported: true,
      complete: true,
      error: null,
    });
    expect(markdown).toContain("No deposit or withdrawal activity found in the last 90 days");
    expect(metadata.dataStatus).toBe("empty");
  });
});

describe("generateTradingProfile", () => {
  it("groups fees by currency instead of summing mixed units", () => {
    const trades = [
      trade({ id: "a", fee: 0.5, feeCurrency: "BGB", timestamp: now - 30 * DAY }),
      trade({ id: "b", fee: 1.25, feeCurrency: "USDT", timestamp: now - 20 * DAY }),
      trade({ id: "c", fee: 0.25, feeCurrency: "USDT", timestamp: now - 10 * DAY }),
    ];
    const { markdown } = generateTradingProfile(trades, [], [], "bitget");
    expect(markdown).toContain("Fees paid: 1.5 USDT + 0.5 BGB");
    expect(markdown).not.toContain("Total fees paid: $");
  });

  it("omits the fee line when no fees were recorded", () => {
    const { markdown } = generateTradingProfile([trade({})], [], [], "bitget");
    expect(markdown).not.toContain("Fees paid");
  });

  it("aggregates USD-stable-quoted volume as $ and labels other quotes per currency", () => {
    const trades = [
      trade({ id: "a", symbol: "BTC/USDT", cost: 1000, timestamp: now - 30 * DAY }),
      trade({ id: "b", symbol: "ETH/BTC", cost: 0.5, timestamp: now - 20 * DAY }),
    ];
    const { markdown } = generateTradingProfile(trades, [], [], "binance");
    expect(markdown).toContain("Total volume: $1.0k (USD-quoted pairs)");
    expect(markdown).toContain("Volume in BTC-quoted pairs: 0.5 BTC");
    // Pair table labels the non-USD pair volume with its quote unit.
    expect(markdown).toContain("| ETH/BTC | 1 | 0.5 BTC |");
  });

  it("computes trade-size stats only over USD-quoted trades", () => {
    const trades = [
      trade({ id: "a", symbol: "BTC/USDT", cost: 100, timestamp: now - 30 * DAY }),
      trade({ id: "b", symbol: "BTC/USDT", cost: 300, timestamp: now - 25 * DAY }),
      trade({ id: "c", symbol: "ETH/BTC", cost: 5, timestamp: now - 20 * DAY }),
    ];
    const { markdown } = generateTradingProfile(trades, [], [], "binance");
    expect(markdown).toContain("Avg trade size: $200");
    expect(markdown).toContain("Max trade size: $300");
  });

  it("distinguishes 'unsupported' from 'holding account'", () => {
    const { markdown, metadata } = generateTradingProfile([], [], [], "someexchange", {
      supported: false,
      complete: true,
      error: null,
    });
    expect(markdown).toContain("does not expose trade history");
    expect(markdown).not.toContain("primarily for holding");
    expect(metadata.dataStatus).toBe("unsupported");
  });

  it("distinguishes 'fetch failed' from 'holding account'", () => {
    const { markdown, metadata } = generateTradingProfile([], [], [], "binance", {
      supported: true,
      complete: false,
      error: "boom",
    });
    expect(markdown).toContain("could not be retrieved");
    expect(metadata.dataStatus).toBe("error");
  });

  it("keeps the holding-account message for a genuinely quiet account", () => {
    const { markdown, metadata } = generateTradingProfile([], [], [], "okx", {
      supported: true,
      complete: true,
      error: null,
    });
    expect(markdown).toContain("primarily for holding");
    expect(metadata.dataStatus).toBe("empty");
  });

  it("notes incomplete fetches as lower bounds when trades exist", () => {
    const { markdown, metadata } = generateTradingProfile([trade({})], [], [], "binance", {
      supported: true,
      complete: false,
      error: "time limit reached",
    });
    expect(markdown).toContain("lower bounds");
    expect(metadata.dataStatus).toBe("partial");
  });
});
