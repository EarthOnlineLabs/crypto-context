/**
 * Fabricated dashboard fixtures — power the public /demo and the dev-only
 * /dev/preview harness.
 *
 * IMPORTANT: every value here is INVENTED. It must never contain a real user's
 * holdings, addresses, or API data.
 */
import type { DashboardMock } from "@/components/dashboard/DashboardProvider";

const now = Date.now();
const minutesAgo = (m: number) => new Date(now - m * 60_000).toISOString();
const daysAgo = (d: number) => new Date(now - d * 86_400_000).toISOString();

/** A populated, diversified portfolio — an active multi-venue trader. */
export const populatedMock: DashboardMock = {
  user: { id: "preview-user", email: "preview@cryptocontext.dev" },
  connections: [
    { id: "c1", exchange: "binance", label: "API key", created_at: daysAgo(86) },
    { id: "c2", exchange: "bybit", label: "API key", created_at: daysAgo(41) },
  ],
  wallets: [
    {
      id: "w1",
      address: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
      chain: "ethereum",
      label: "Main",
      brand: "metamask",
      created_at: daysAgo(63),
    },
    {
      // Same chain as w1, no label & no brand — proves two ETH wallets are now
      // distinguishable (badge + always-visible address): the bug Batch C fixes.
      id: "w4",
      address: "0x3a1f9C4b7E2d6F8091a2B3c4D5e6F7081923AbCd",
      chain: "ethereum",
      label: "",
      created_at: daysAgo(40),
    },
    {
      id: "w2",
      address: "0x9aF3b1C2D4e5F60718293A4b5C6d7E8f90123456",
      chain: "arbitrum",
      label: "DeFi",
      brand: "rabby",
      created_at: daysAgo(22),
    },
    {
      id: "w3",
      address: "Fix7ureSo1anaWa11etDoNotUseRea1Funds1111111",
      chain: "solana",
      label: "",
      brand: "phantom",
      created_at: daysAgo(8),
    },
  ],
  portfolio: {
    context:
      "Active multi-venue trader. ETH-weighted core with a BTC hedge, rotating into L2 governance tokens. Regular weekly deposits suggest a DCA discipline alongside discretionary swing trades.",
    totalUsdValue: 96_800,
    holdings: [
      { asset: "ETH", amount: 8.6, usdValue: 30_008, allocation: 31, sources: ["binance", "ethereum"] },
      { asset: "BTC", amount: 0.37, usdValue: 25_168, allocation: 26, sources: ["binance", "bybit"] },
      { asset: "SOL", amount: 71.2, usdValue: 13_552, allocation: 14, sources: ["bybit"] },
      { asset: "USDC", amount: 11_616, usdValue: 11_616, allocation: 12, sources: ["binance", "arbitrum"] },
      { asset: "ARB", amount: 9_200, usdValue: 8_712, allocation: 9, sources: ["arbitrum"] },
      { asset: "LINK", amount: 412, usdValue: 7_744, allocation: 8, sources: ["ethereum"] },
    ],
    snapshots: [
      { exchange: "binance", totalUsdValue: 54_300, holdingsCount: 5, fetchedAt: minutesAgo(7) },
      { exchange: "bybit", totalUsdValue: 21_400, holdingsCount: 3, fetchedAt: minutesAgo(7) },
    ],
    walletSnapshots: [
      { address: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F", chain: "ethereum", totalUsdValue: 14_300, holdingsCount: 3, fetchedAt: minutesAgo(9) },
      { address: "0x9aF3b1C2D4e5F60718293A4b5C6d7E8f90123456", chain: "arbitrum", totalUsdValue: 6_800, holdingsCount: 2, fetchedAt: minutesAgo(9) },
      { address: "Fix7ureSo1anaWa11etDoNotUseRea1Funds1111111", chain: "solana", totalUsdValue: 4_200, holdingsCount: 2, fetchedAt: minutesAgo(9) },
    ],
    errors: [{ source: "okx", error: "Invalid API credentials" }],
  },
  mcpTokens: [
    { id: "t1", name: "Claude Code", permission_level: "full", revoked: false, created_at: daysAgo(30) },
    { id: "t2", name: "Cursor", permission_level: "portfolio_only", revoked: false, created_at: daysAgo(12) },
    { id: "t3", name: "Old Agent", permission_level: "full", revoked: true, created_at: daysAgo(75) },
  ],
  contextDocs: [
    {
      dimension: "trading_profile",
      exchange: "binance",
      label: "API key",
      updatedAt: minutesAgo(9),
      metadata: {
        tradeCount: 247,
        tradesPerWeek: 12.3,
        uniquePairs: 18,
        hasOpenOrders: true,
        dataStatus: "ok",
        dateRange: { from: daysAgo(180).slice(0, 10), to: daysAgo(0).slice(0, 10) },
      },
      content:
        "Trading Profile — binance\n- 247 trades across 18 pairs over the last 180 days\n- ~12 trades/week, concentrated around ETH and majors\n- Holds open limit orders; comfortable with maker-side execution\n- Behaviour: swing trades layered on a long-term core",
    },
    {
      dimension: "fund_flow",
      exchange: "binance",
      label: "API key",
      updatedAt: minutesAgo(9),
      metadata: {
        totalDeposits: 14,
        totalWithdrawals: 6,
        totalTransfers: 20,
        fundingPattern: "regular",
        dataStatus: "ok",
        dateRange: { from: daysAgo(180).slice(0, 10), to: daysAgo(0).slice(0, 10) },
      },
      content:
        "Fund Flow — binance\n- 14 deposits, 6 withdrawals over 180 days\n- Regular cadence consistent with weekly DCA\n- Net inflow; withdrawals align with periodic profit-taking",
    },
    {
      dimension: "trading_profile",
      exchange: "bybit",
      label: "API key",
      updatedAt: minutesAgo(7),
      metadata: { tradeCount: 0, hasOpenOrders: false, dataStatus: "empty" },
      content:
        "Trading Profile — bybit\n> No trading activity found in the last 90 days.\n\nThis account appears to be used primarily for holding, not active trading.",
    },
    {
      dimension: "fund_flow",
      exchange: "bybit",
      label: "API key",
      updatedAt: minutesAgo(7),
      metadata: {
        totalDeposits: 2,
        totalWithdrawals: 0,
        totalTransfers: 2,
        fundingPattern: "lump_sum",
        dataStatus: "ok",
        dateRange: { from: daysAgo(120).slice(0, 10), to: daysAgo(45).slice(0, 10) },
      },
      content:
        "Fund Flow — bybit\n- 2 deposits, 0 withdrawals\n- Lump-sum funding; account used as a holding venue",
    },
  ],
  investorProfile: {
    summary:
      "A disciplined core-and-satellite crypto investor running an ETH-weighted base with a BTC hedge, then rotating a smaller satellite sleeve into L2 governance tokens. Regular weekly deposits point to DCA conviction layered under discretionary swing trades.",
    tradingStyle:
      "Active but structured: ~12 maker-side trades a week around majors, with open limit orders rather than market chasing. Swing positions sit on top of a long-held core that rarely gets sold.",
    riskProfile:
      "Moderate. Top-3 assets hold ~71% of the book and the stablecoin buffer sits near 12% — enough dry powder for entries without being defensive. Concentration risk is in ETH, by intent.",
    preferences: [
      "ETH as the portfolio anchor",
      "BTC as a macro hedge",
      "L2 governance tokens (ARB)",
      "Blue-chip oracles (LINK)",
      "Maker-side limit execution",
    ],
    behaviors: [
      "Weekly deposit cadence consistent with DCA",
      "Keeps a long-term core untouched while swing-trading around it",
      "Withdrawals cluster around periodic profit-taking",
      "Comfortable holding open limit orders across venues",
    ],
    agentGuidance: [
      "Lead with limit-order and DCA framing — this user dislikes market chasing",
      "Treat the ETH core as semi-permanent; don't suggest trimming it casually",
      "Flag the ~12% cash buffer before proposing new entries",
      "Surface L2 and oracle news proactively; that's the active satellite sleeve",
    ],
    generatedAt: minutesAgo(9),
    source: "llm",
  },
  notes: `Core thesis: ETH is my long-term anchor — I don't sell the base position. BTC is a macro hedge, sized smaller.

Rules I try to follow:
- Only add to majors on 20%+ drawdowns; never market-buy into strength.
- Keep at least 10% in stables as dry powder.
- L2 governance tokens (ARB, OP) are a satellite sleeve, max ~15% combined.

Ideas to try next:
- Rotate a small slice of the memecoin churn into a SOL DeFi position.
- Stop day-trading WIF/JUP — fees are eating the gains.

What I want from an AI: hold me to the DCA discipline and flag when I'm drifting from these rules.`,
};

/** A brand-new account — drives the first-run onboarding + empty states. */
export const emptyMock: DashboardMock = {
  user: { id: "preview-user", email: "preview@cryptocontext.dev" },
  connections: [],
  wallets: [],
  portfolio: null,
  mcpTokens: [],
  contextDocs: [],
};
