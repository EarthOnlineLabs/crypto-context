/**
 * Context generation engine.
 * Transforms raw portfolio data into structured markdown context files.
 */

import type { PortfolioSnapshot, PortfolioHolding } from "./exchange";

export interface UserContext {
  portfolio: string; // portfolio.md content
  updatedAt: string;
}

function formatUsd(value: number): string {
  return `$${value.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

/**
 * Generate portfolio.md from one or more exchange snapshots.
 */
export function generatePortfolioContext(
  snapshots: PortfolioSnapshot[]
): string {
  if (snapshots.length === 0) {
    return "# Portfolio\n\nNo exchanges connected yet.";
  }

  // Aggregate holdings across exchanges
  const aggregated = new Map<
    string,
    {
      asset: string;
      total: number;
      usdValue: number;
      venues: { exchange: string; amount: number }[];
    }
  >();

  let grandTotal = 0;

  for (const snapshot of snapshots) {
    for (const h of snapshot.holdings) {
      const existing = aggregated.get(h.asset);
      if (existing) {
        existing.total += h.total;
        existing.usdValue += h.usdValue ?? 0;
        existing.venues.push({ exchange: snapshot.exchange, amount: h.total });
      } else {
        aggregated.set(h.asset, {
          asset: h.asset,
          total: h.total,
          usdValue: h.usdValue ?? 0,
          venues: [{ exchange: snapshot.exchange, amount: h.total }],
        });
      }
    }
    grandTotal += snapshot.totalUsdValue;
  }

  // Sort by USD value
  const sorted = Array.from(aggregated.values()).sort(
    (a, b) => b.usdValue - a.usdValue
  );

  // Build markdown
  const lines: string[] = [];
  const lastSync = snapshots
    .map((s) => s.fetchedAt)
    .sort()
    .pop();

  lines.push("# Portfolio Snapshot");
  lines.push(`> Last synced: ${lastSync}`);
  lines.push(
    `> Total value: ${formatUsd(grandTotal)} (across ${snapshots.length} exchange${snapshots.length > 1 ? "s" : ""})`
  );
  lines.push("");

  // Holdings table
  lines.push("## Holdings");
  lines.push("");
  lines.push("| Asset | Amount | Value | % of Portfolio | Location |");
  lines.push("|-------|--------|-------|----------------|----------|");

  for (const h of sorted) {
    if (h.usdValue < 1) continue; // skip dust

    const pct =
      grandTotal > 0 ? formatPercent((h.usdValue / grandTotal) * 100) : "—";

    const location = h.venues
      .map(
        (v) =>
          `${v.exchange} (${v.amount.toLocaleString("en-US", { maximumFractionDigits: 4 })})`
      )
      .join(" + ");

    lines.push(
      `| ${h.asset} | ${h.total.toLocaleString("en-US", { maximumFractionDigits: 6 })} | ${formatUsd(h.usdValue)} | ${pct} | ${location} |`
    );
  }

  lines.push("");

  // Concentration analysis
  if (sorted.length > 0 && grandTotal > 0) {
    lines.push("## Concentration");

    const top1 = sorted[0];
    const top1pct = (top1.usdValue / grandTotal) * 100;
    lines.push(
      `- Top 1 asset: ${top1.asset} ${formatPercent(top1pct)}${top1pct > 50 ? " (HIGH concentration)" : ""}`
    );

    const top3value = sorted
      .slice(0, 3)
      .reduce((sum, h) => sum + h.usdValue, 0);
    lines.push(
      `- Top 3 assets: ${formatPercent((top3value / grandTotal) * 100)}`
    );

    // Stablecoin ratio
    const stablecoins = ["USDT", "USDC", "USD", "BUSD", "DAI", "TUSD"];
    const stableValue = sorted
      .filter((h) => stablecoins.includes(h.asset))
      .reduce((sum, h) => sum + h.usdValue, 0);
    const stablePct = (stableValue / grandTotal) * 100;
    lines.push(
      `- Stablecoin ratio: ${formatPercent(stablePct)}${stablePct < 5 ? " (LOW cash reserve)" : stablePct > 50 ? " (HIGH cash position)" : ""}`
    );

    lines.push("");

    // Exchange distribution
    lines.push("## Exchange Distribution");
    for (const snapshot of snapshots) {
      const pct = (snapshot.totalUsdValue / grandTotal) * 100;
      lines.push(
        `- ${snapshot.exchange}: ${formatPercent(pct)} (${formatUsd(snapshot.totalUsdValue)})`
      );
    }
  }

  return lines.join("\n");
}

/**
 * Generate a user context object from snapshots.
 */
export function buildUserContext(
  snapshots: PortfolioSnapshot[]
): UserContext {
  return {
    portfolio: generatePortfolioContext(snapshots),
    updatedAt: new Date().toISOString(),
  };
}
