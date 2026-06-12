import type { TransferRecord } from "../exchange-history";
import type { FetchQuality } from "../exchange-history";

interface CurrencyFlow {
  currency: string;
  depositCount: number;
  depositVolume: number;
  withdrawalCount: number;
  withdrawalVolume: number;
  netFlow: number;
}

interface FlowAnalysis {
  totalDeposits: number;
  totalWithdrawals: number;
  currencyFlows: CurrencyFlow[];
  /** Currency with the most transfers — the only one safe to summarize in one line. */
  primaryFlow: CurrencyFlow | null;
  dateRange: { from: string; to: string } | null;
  fundingPattern: "regular" | "lump_sum" | "mixed" | "inactive";
  lastDepositDate: string | null;
  lastWithdrawalDate: string | null;
  recentTransfers: TransferRecord[];
}

function formatAmount(value: number): string {
  return value.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

function formatDate(ts: number): string {
  return new Date(ts).toISOString().slice(0, 10);
}

/**
 * Funding cadence detection. Amount regularity is only meaningful within a single
 * currency, so the amount-variance check runs on the dominant deposit currency;
 * timing intervals use all deposits (cadence is currency-agnostic).
 */
function detectFundingPattern(
  deposits: TransferRecord[],
): "regular" | "lump_sum" | "mixed" | "inactive" {
  if (deposits.length === 0) return "inactive";
  if (deposits.length === 1) return "lump_sum";

  const sorted = [...deposits].sort((a, b) => a.timestamp - b.timestamp);
  const intervals = sorted.slice(1).map((d, i) => d.timestamp - sorted[i].timestamp);

  const DAY_MS = 24 * 60 * 60 * 1000;
  const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length / DAY_MS;

  // Dominant-currency deposits for the amount-consistency check (never mix units).
  const byCurrency = new Map<string, TransferRecord[]>();
  for (const d of deposits) {
    const list = byCurrency.get(d.currency) ?? [];
    list.push(d);
    byCurrency.set(d.currency, list);
  }
  const dominant = [...byCurrency.values()].sort((a, b) => b.length - a.length)[0] ?? [];
  const amounts = dominant.map((d) => d.amount);
  const avgAmount = amounts.reduce((a, b) => a + b, 0) / Math.max(amounts.length, 1);
  const amountVariance =
    amounts.reduce((sum, a) => sum + (a - avgAmount) ** 2, 0) / Math.max(amounts.length, 1);
  const cv = avgAmount > 0 ? Math.sqrt(amountVariance) / avgAmount : 0;

  if (intervals.length >= 2) {
    const intervalCv = (() => {
      const avgI = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const variance = intervals.reduce((sum, i) => sum + (i - avgI) ** 2, 0) / intervals.length;
      return Math.sqrt(variance) / avgI;
    })();

    if (intervalCv < 0.4 && avgInterval < 60) return "regular";
  }

  if (cv > 1.5 || deposits.length <= 2) return "lump_sum";
  return "mixed";
}

function analyze(transfers: TransferRecord[]): FlowAnalysis {
  const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
  const now = Date.now();

  const deposits = transfers.filter((t) => t.type === "deposit");
  const withdrawals = transfers.filter((t) => t.type === "withdrawal");
  const recentTransfers = transfers.filter((t) => t.timestamp > now - THIRTY_DAYS);

  if (transfers.length === 0) {
    return {
      totalDeposits: 0,
      totalWithdrawals: 0,
      currencyFlows: [],
      primaryFlow: null,
      dateRange: null,
      fundingPattern: "inactive",
      lastDepositDate: null,
      lastWithdrawalDate: null,
      recentTransfers: [],
    };
  }

  const timestamps = transfers.map((t) => t.timestamp);
  const first = Math.min(...timestamps);
  const last = Math.max(...timestamps);

  const flowMap = new Map<string, CurrencyFlow>();

  for (const t of transfers) {
    const flow = flowMap.get(t.currency) ?? {
      currency: t.currency,
      depositCount: 0,
      depositVolume: 0,
      withdrawalCount: 0,
      withdrawalVolume: 0,
      netFlow: 0,
    };

    if (t.type === "deposit") {
      flow.depositCount++;
      flow.depositVolume += t.amount;
    } else {
      flow.withdrawalCount++;
      flow.withdrawalVolume += t.amount;
    }
    flow.netFlow = flow.depositVolume - flow.withdrawalVolume;

    flowMap.set(t.currency, flow);
  }

  // Sort by activity (transfer count, then volume within the same currency only).
  const currencyFlows = Array.from(flowMap.values()).sort(
    (a, b) =>
      b.depositCount + b.withdrawalCount - (a.depositCount + a.withdrawalCount) ||
      b.depositVolume + b.withdrawalVolume - (a.depositVolume + a.withdrawalVolume),
  );

  const lastDeposit = deposits.length > 0
    ? Math.max(...deposits.map((d) => d.timestamp))
    : null;
  const lastWithdrawal = withdrawals.length > 0
    ? Math.max(...withdrawals.map((w) => w.timestamp))
    : null;

  return {
    totalDeposits: deposits.length,
    totalWithdrawals: withdrawals.length,
    currencyFlows,
    primaryFlow: currencyFlows[0] ?? null,
    dateRange: { from: formatDate(first), to: formatDate(last) },
    fundingPattern: detectFundingPattern(deposits),
    lastDepositDate: lastDeposit ? formatDate(lastDeposit) : null,
    lastWithdrawalDate: lastWithdrawal ? formatDate(lastWithdrawal) : null,
    recentTransfers,
  };
}

export function generateFundFlow(
  transfers: TransferRecord[],
  exchangeName: string,
  quality?: FetchQuality,
): { markdown: string; metadata: Record<string, unknown> } {
  const a = analyze(transfers);
  const lines: string[] = [];

  lines.push(`# Fund Flow — ${exchangeName}`);

  if (quality && !quality.supported) {
    lines.push("> This exchange's API does not expose deposit/withdrawal history — fund flow can't be analyzed here.");
    return {
      markdown: lines.join("\n"),
      metadata: { totalTransfers: 0, dataStatus: "unsupported" },
    };
  }

  if (a.totalDeposits === 0 && a.totalWithdrawals === 0) {
    if (quality?.error) {
      lines.push("> Deposit/withdrawal history could not be retrieved (fetch failed). Absence of transfers here does NOT mean the account is inactive.");
      return {
        markdown: lines.join("\n"),
        metadata: { totalTransfers: 0, dataStatus: "error" },
      };
    }
    lines.push("> No deposit or withdrawal activity found in the last 90 days.");
    return {
      markdown: lines.join("\n"),
      metadata: { totalTransfers: 0, dataStatus: "empty" },
    };
  }

  const total = a.totalDeposits + a.totalWithdrawals;
  lines.push(`> Based on ${total} transfers (${a.dateRange?.from} to ${a.dateRange?.to}, 90-day window)`);
  if (quality && (quality.error || !quality.complete)) {
    lines.push("> Note: history fetch was incomplete — figures are lower bounds, not totals.");
  }
  lines.push("");

  // Overview — counts only; amounts are never summed across currencies.
  lines.push("## Overview");
  lines.push(`- Deposits: ${a.totalDeposits} · Withdrawals: ${a.totalWithdrawals}`);
  if (a.primaryFlow) {
    const p = a.primaryFlow;
    const net = p.netFlow > 0 ? `+${formatAmount(p.netFlow)}` : formatAmount(p.netFlow);
    lines.push(
      `- Most active currency: ${p.currency} — ${p.depositCount} in / ${p.withdrawalCount} out, net ${net} ${p.currency}`,
    );
    if (p.depositCount > 0) {
      lines.push(
        `- Avg ${p.currency} deposit: ${formatAmount(p.depositVolume / p.depositCount)} ${p.currency}`,
      );
    }
  }
  lines.push("");

  // Flow by Currency — each row is a single unit, so the numbers are meaningful.
  if (a.currencyFlows.length > 0) {
    lines.push("## Flow by Currency");
    lines.push("| Currency | Deposits | Withdrawals | Net |");
    lines.push("|----------|----------|-------------|-----|");
    for (const f of a.currencyFlows) {
      const depStr = f.depositCount > 0
        ? `${f.depositCount}x (${formatAmount(f.depositVolume)})`
        : "—";
      const wdStr = f.withdrawalCount > 0
        ? `${f.withdrawalCount}x (${formatAmount(f.withdrawalVolume)})`
        : "—";
      const netStr = f.netFlow > 0
        ? `+${formatAmount(f.netFlow)} ${f.currency}`
        : `${formatAmount(f.netFlow)} ${f.currency}`;
      lines.push(`| ${f.currency} | ${depStr} | ${wdStr} | ${netStr} |`);
    }
    lines.push("");
  }

  // Funding Pattern
  lines.push("## Funding Pattern");
  const patternLabels: Record<string, string> = {
    regular: "Regular (recurring deposits at consistent intervals)",
    lump_sum: "Lump sum (infrequent, large deposits)",
    mixed: "Mixed (irregular deposit pattern)",
    inactive: "Inactive (no recent deposits)",
  };
  lines.push(`- Pattern: ${patternLabels[a.fundingPattern]}`);
  if (a.lastDepositDate) lines.push(`- Last deposit: ${a.lastDepositDate}`);
  if (a.lastWithdrawalDate) lines.push(`- Last withdrawal: ${a.lastWithdrawalDate}`);
  lines.push("");

  // Recent Activity
  if (a.recentTransfers.length > 0) {
    lines.push("## Recent Activity (Last 30 Days)");
    const recentDeps = a.recentTransfers.filter((t) => t.type === "deposit");
    const recentWds = a.recentTransfers.filter((t) => t.type === "withdrawal");
    lines.push(`- ${recentDeps.length} deposits, ${recentWds.length} withdrawals`);

    for (const t of a.recentTransfers.slice(-5)) {
      const arrow = t.type === "deposit" ? "IN" : "OUT";
      lines.push(
        `- [${arrow}] ${formatDate(t.timestamp)}: ${t.amount.toLocaleString("en-US", { maximumFractionDigits: 4 })} ${t.currency}`,
      );
    }
    lines.push("");
  }

  return {
    markdown: lines.join("\n"),
    metadata: {
      totalTransfers: total,
      totalDeposits: a.totalDeposits,
      totalWithdrawals: a.totalWithdrawals,
      fundingPattern: a.fundingPattern,
      dateRange: a.dateRange,
      primaryCurrency: a.primaryFlow?.currency ?? null,
      primaryNetFlow: a.primaryFlow ? Math.round(a.primaryFlow.netFlow * 100) / 100 : null,
      dataStatus: quality && (quality.error || !quality.complete) ? "partial" : "ok",
    },
  };
}
