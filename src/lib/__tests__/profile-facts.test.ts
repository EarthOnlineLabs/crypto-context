import { describe, expect, it } from "vitest";
import { buildFactsMarkdown, type ProfileInput } from "../generators/investor-profile";

function input(overrides: Partial<ProfileInput> = {}): ProfileInput {
  return {
    totalUsdValue: 96_800,
    exchangeCount: 2,
    walletCount: 3,
    holdings: [
      { asset: "ETH", usdValue: 30_000, allocation: 31, sources: ["binance"] },
      { asset: "BTC", usdValue: 25_000, allocation: 26, sources: ["bybit"] },
      { asset: "USDC", usdValue: 11_600, allocation: 12, sources: ["binance"] },
    ],
    venues: [
      { label: "binance", usdValue: 54_000 },
      { label: "ethereum wallet", usdValue: 14_000 },
    ],
    tradingDocs: ["TRADES_SUMMARY"],
    fundFlowDocs: ["FLOWS_SUMMARY"],
    ...overrides,
  };
}

describe("buildFactsMarkdown", () => {
  it("includes holdings, concentration and venue split", () => {
    const md = buildFactsMarkdown(input());
    expect(md).toContain("ETH 31.0%");
    expect(md).toContain("Concentration:");
    expect(md).toContain("stablecoin 12.0%");
    expect(md).toContain("Venue split:");
    expect(md).toContain("TRADES_SUMMARY");
    expect(md).toContain("FLOWS_SUMMARY");
  });

  it("includes the user's notes as their own-words section", () => {
    const md = buildFactsMarkdown(input({ notes: "我想定投纳指，抓 AI 趋势。" }));
    expect(md).toContain("Investor Notes");
    expect(md).toContain("我想定投纳指");
  });

  it("omits the notes section when notes are absent or blank", () => {
    expect(buildFactsMarkdown(input())).not.toContain("Investor Notes");
    expect(buildFactsMarkdown(input({ notes: "  \n " }))).not.toContain("Investor Notes");
  });

  it("truncates very long notes to keep the prompt bounded", () => {
    const md = buildFactsMarkdown(input({ notes: "x".repeat(20_000) }));
    const notesPart = md.split("Investor Notes")[1] ?? "";
    expect(notesPart.length).toBeLessThan(9_000);
  });

  it("never embeds keys or addresses (only labels reach the prompt)", () => {
    const md = buildFactsMarkdown(input());
    expect(md).not.toMatch(/0x[0-9a-fA-F]{40}/);
    expect(md).not.toMatch(/api[_-]?key/i);
  });
});
