import { describe, expect, it } from "vitest";
import { generateFullContext, generatePortfolioContext, type ContextDocument } from "../context";

const DOCS: ContextDocument[] = [
  { dimension: "trading_profile", content: "TRADING_DOC", updated_at: "2026-01-01" },
  { dimension: "fund_flow", content: "FUNDFLOW_DOC", updated_at: "2026-01-01" },
];

describe("generateFullContext", () => {
  it("puts the user's notes BEFORE the AI profile (notes lead the context)", () => {
    const out = generateFullContext("PORTFOLIO_MD", DOCS, "PROFILE_MD", "MY_NOTES");
    const notesIdx = out.indexOf("MY_NOTES");
    const profileIdx = out.indexOf("PROFILE_MD");
    expect(notesIdx).toBeGreaterThan(-1);
    expect(profileIdx).toBeGreaterThan(-1);
    expect(notesIdx).toBeLessThan(profileIdx);
    expect(out).toContain("Investor Notes");
  });

  it("orders: notes → profile → portfolio → trading → fund flow", () => {
    const out = generateFullContext("PORTFOLIO_MD", DOCS, "PROFILE_MD", "MY_NOTES");
    const order = ["MY_NOTES", "PROFILE_MD", "PORTFOLIO_MD", "TRADING_DOC", "FUNDFLOW_DOC"].map(
      (m) => out.indexOf(m),
    );
    expect([...order].sort((a, b) => a - b)).toEqual(order);
  });

  it("omits the notes section when notes are empty/whitespace", () => {
    expect(generateFullContext("P", DOCS, "PROFILE", "")).not.toContain("Investor Notes");
    expect(generateFullContext("P", DOCS, "PROFILE", "   \n ")).not.toContain("Investor Notes");
    expect(generateFullContext("P", DOCS, "PROFILE", undefined)).not.toContain("Investor Notes");
  });

  it("omits the profile section when absent and still renders the portfolio", () => {
    const out = generateFullContext("PORTFOLIO_MD", DOCS);
    expect(out).toContain("PORTFOLIO_MD");
    expect(out).not.toContain("Investor Notes");
  });

  it("notes content is included verbatim (incl. Chinese)", () => {
    const zh = "核心论点：ETH 长期持有，BTC 对冲。";
    expect(generateFullContext("P", [], undefined, zh)).toContain(zh);
  });

  it("mentions sync hint when no analysis docs exist", () => {
    const out = generateFullContext("P", []);
    expect(out.toLowerCase()).toContain("sync");
  });

  it("opens with reading guidance and an accurate contents line", () => {
    const out = generateFullContext("PORTFOLIO_MD", DOCS, "PROFILE_MD", "MY_NOTES");
    expect(out).toContain("For the AI reading this");
    expect(out).toContain(
      "Contents: Investor Notes (the user's own words) → Investor Profile (synthesized) → Portfolio Snapshot → Trading Profile (per exchange) → Fund Flow (per exchange).",
    );
    // Without notes/profile the contents line shrinks accordingly.
    const bare = generateFullContext("PORTFOLIO_MD", []);
    expect(bare).toContain("Contents: Portfolio Snapshot.");
  });

  it("flags a profile older than the notes as stale (notes win)", () => {
    const out = generateFullContext("P", [], "PROFILE_MD", "MY_NOTES", {
      profileGeneratedAt: "2026-06-01T00:00:00Z",
      notesUpdatedAt: "2026-06-10T00:00:00Z",
    });
    expect(out).toContain("updated after this profile was generated");
    expect(out).toContain("notes are authoritative");
  });

  it("stays quiet when the profile is fresher than the notes", () => {
    const out = generateFullContext("P", [], "PROFILE_MD", "MY_NOTES", {
      profileGeneratedAt: "2026-06-10T00:00:00Z",
      notesUpdatedAt: "2026-06-01T00:00:00Z",
    });
    expect(out).not.toContain("updated after this profile was generated");
  });
});

describe("generatePortfolioContext", () => {
  it("handles the empty state", () => {
    expect(generatePortfolioContext([], [])).toContain("No exchanges or wallets connected");
  });

  it("treats 'all sources unreachable' as UNKNOWN, never as an empty portfolio", () => {
    const out = generatePortfolioContext([], [], [
      { label: "binance", kind: "exchange", status: "unreachable", fetchedAt: null },
      { label: "ethereum:0x3641...dcc3", kind: "wallet", status: "unreachable", fetchedAt: null },
    ]);
    expect(out).toContain("UNKNOWN");
    expect(out).toContain("unreachable");
    expect(out).not.toContain("No exchanges or wallets connected");
    expect(out).toContain("## Data Sources");
  });

  it("flags cached/missing sources near the total and lists them in Data Sources", () => {
    const out = generatePortfolioContext(
      [
        {
          exchange: "binance",
          holdings: [{ asset: "ETH", free: 1, locked: 0, total: 1, usdValue: 3000 }],
          totalUsdValue: 3000,
          fetchedAt: "2026-06-11T00:00:00Z",
        },
      ],
      [],
      [
        { label: "binance", kind: "exchange", status: "cached", fetchedAt: "2026-06-11T00:00:00Z" },
        { label: "solana:6h2svd...uzjE", kind: "wallet", status: "unreachable", fetchedAt: null },
      ],
    );
    expect(out).toContain("Incomplete picture");
    expect(out).toContain("binance shown from a cached snapshot");
    expect(out).toContain("solana:6h2svd...uzjE missing entirely");
    expect(out).toContain("| binance | exchange | cached snapshot (live fetch failed) | 2026-06-11 00:00 UTC |");
  });

  it("renders an all-live Data Sources table without warnings", () => {
    const out = generatePortfolioContext(
      [
        {
          exchange: "binance",
          holdings: [{ asset: "ETH", free: 1, locked: 0, total: 1, usdValue: 3000 }],
          totalUsdValue: 3000,
          fetchedAt: "2026-06-12T03:20:00Z",
        },
      ],
      [],
      [{ label: "binance", kind: "exchange", status: "live", fetchedAt: "2026-06-12T03:20:00Z" }],
    );
    expect(out).toContain("| binance | exchange | live | 2026-06-12 03:20 UTC |");
    expect(out).not.toContain("Incomplete picture");
  });

  it("aggregates the same asset across venues and flags concentration", () => {
    const out = generatePortfolioContext(
      [
        {
          exchange: "binance",
          holdings: [{ asset: "ETH", free: 1, locked: 0, total: 1, usdValue: 3000 }],
          totalUsdValue: 3000,
          fetchedAt: "2026-01-01T00:00:00Z",
        },
        {
          exchange: "bybit",
          holdings: [{ asset: "ETH", free: 2, locked: 0, total: 2, usdValue: 6000 }],
          totalUsdValue: 6000,
          fetchedAt: "2026-01-01T00:00:00Z",
        },
      ],
      [],
    );
    expect(out).toContain("ETH");
    expect(out).toContain("binance");
    expect(out).toContain("HIGH concentration"); // single asset = 100%
    expect(out).toContain("$9,000");
  });
});
