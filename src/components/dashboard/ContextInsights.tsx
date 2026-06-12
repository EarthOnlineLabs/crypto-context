"use client";

import { useState, type ReactNode } from "react";
import type { ContextDoc } from "./types";
import { formatDate } from "@/lib/timeAgo";
import { exchangeDisplayName } from "@/lib/exchange-names";

interface Props {
  documents: ContextDoc[];
}

/** Resolved presentation state for a card body. */
type DocState =
  | { kind: "data" }
  | { kind: "quiet"; message: string }
  | { kind: "warn"; message: string };

function tradingState(doc: ContextDoc): DocState {
  const status = doc.metadata.dataStatus as string | undefined;
  if (status === "unsupported")
    return { kind: "quiet", message: "This exchange's API doesn't expose trade history." };
  if (status === "error")
    return { kind: "warn", message: "Couldn't fetch trade history on the last sync — try syncing again." };
  if (((doc.metadata.tradeCount as number) ?? 0) === 0)
    return { kind: "quiet", message: "No trades in the last 90 days — looks like a holding account." };
  return { kind: "data" };
}

function fundFlowState(doc: ContextDoc): DocState {
  const status = doc.metadata.dataStatus as string | undefined;
  if (status === "unsupported")
    return { kind: "quiet", message: "This exchange's API doesn't expose transfer history." };
  if (status === "error")
    return { kind: "warn", message: "Couldn't fetch transfers on the last sync — try syncing again." };
  if (((doc.metadata.totalTransfers as number) ?? 0) === 0)
    return { kind: "quiet", message: "No deposits or withdrawals in the last 90 days." };
  return { kind: "data" };
}

function Metric({ label, value, tone }: { label: string; value: ReactNode; tone?: string }) {
  return (
    <div>
      <div className="text-xs text-gray-400">{label}</div>
      <div className={`text-lg font-bold ${tone ?? "text-gray-900"}`}>{value}</div>
    </div>
  );
}

function InsightCard({
  icon,
  title,
  doc,
  state,
  expandLabel,
  children,
}: {
  icon: ReactNode;
  title: string;
  doc: ContextDoc;
  state: DocState;
  expandLabel: string;
  children?: ReactNode;
}) {
  const [expanded, setExpanded] = useState(false);
  const partial = (doc.metadata.dataStatus as string | undefined) === "partial";

  return (
    <div className="glass rounded-xl overflow-hidden">
      <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <h4 className="text-sm font-medium text-gray-700">{title}</h4>
          {partial && (
            <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20">
              partial data
            </span>
          )}
        </div>
        <span className="text-xs text-gray-400">{formatDate(doc.updatedAt)}</span>
      </div>

      <div className="px-5 py-4">
        {state.kind === "data" ? (
          children
        ) : (
          <p className={`text-sm ${state.kind === "warn" ? "text-amber-700" : "text-gray-400"}`}>
            {state.kind === "warn" && (
              <svg className="mr-1.5 inline h-3.5 w-3.5 -translate-y-px" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            )}
            {state.message}
          </p>
        )}

        <button
          onClick={() => setExpanded(!expanded)}
          className={`text-xs text-emerald-600 hover:text-emerald-500 transition flex items-center gap-1 ${state.kind === "data" ? "" : "mt-2"}`}
        >
          {expanded ? "Hide" : "Show"} {expandLabel}
          <svg
            className={`w-3 h-3 transition-transform ${expanded ? "rotate-180" : ""}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {expanded && (
          <pre className="mt-3 p-4 bg-gray-50 rounded-lg text-xs text-gray-600 overflow-x-auto whitespace-pre-wrap font-mono leading-relaxed border border-gray-100">
            {doc.content}
          </pre>
        )}
      </div>
    </div>
  );
}

function TradingProfileCard({ doc }: { doc: ContextDoc }) {
  const meta = doc.metadata;
  const state = tradingState(doc);
  const dateRange = meta.dateRange as { from: string; to: string } | null;

  return (
    <InsightCard
      doc={doc}
      state={state}
      expandLabel="full profile"
      title="Trading Profile"
      icon={
        <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
        </svg>
      }
    >
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
        <Metric label="Trades" value={(meta.tradeCount as number) ?? 0} />
        <Metric label="Trades/Week" value={((meta.tradesPerWeek as number) ?? 0).toFixed(1)} />
        <Metric label="Pairs Traded" value={(meta.uniquePairs as number) ?? 0} />
        <Metric label="Open Orders" value={meta.hasOpenOrders ? "Yes" : "None"} />
      </div>
      {dateRange && (
        <p className="text-xs text-gray-400 mb-2">Period: {dateRange.from} to {dateRange.to}</p>
      )}
    </InsightCard>
  );
}

function FundFlowCard({ doc }: { doc: ContextDoc }) {
  const meta = doc.metadata;
  const state = fundFlowState(doc);
  const dateRange = meta.dateRange as { from: string; to: string } | null;
  const fundingPattern = (meta.fundingPattern as string) ?? "unknown";

  const patternLabels: Record<string, string> = {
    regular: "Regular (DCA-like)",
    lump_sum: "Lump Sum",
    mixed: "Mixed",
    inactive: "Inactive",
  };

  return (
    <InsightCard
      doc={doc}
      state={state}
      expandLabel="full analysis"
      title="Fund Flow"
      icon={
        <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
        </svg>
      }
    >
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
        <Metric label="Deposits" value={(meta.totalDeposits as number) ?? 0} tone="text-emerald-600" />
        <Metric label="Withdrawals" value={(meta.totalWithdrawals as number) ?? 0} tone="text-rose-500" />
        <Metric label="Total Transfers" value={(meta.totalTransfers as number) ?? 0} />
        <div>
          <div className="text-xs text-gray-400">Pattern</div>
          <div className="text-sm font-bold text-gray-900 pt-1">
            {patternLabels[fundingPattern] ?? fundingPattern}
          </div>
        </div>
      </div>
      {dateRange && (
        <p className="text-xs text-gray-400 mb-2">Period: {dateRange.from} to {dateRange.to}</p>
      )}
    </InsightCard>
  );
}

interface VenueGroup {
  key: string;
  exchange: string | null;
  label: string | null;
  trading?: ContextDoc;
  fundFlow?: ContextDoc;
}

/** One group per connection: its trading + fund-flow docs side by side, labeled. */
function groupByVenue(documents: ContextDoc[]): VenueGroup[] {
  const groups = new Map<string, VenueGroup>();
  for (const doc of documents) {
    const key = `${doc.exchange ?? "unknown"}|${doc.label ?? ""}`;
    const group = groups.get(key) ?? {
      key,
      exchange: doc.exchange ?? null,
      label: doc.label ?? null,
      trading: undefined,
      fundFlow: undefined,
    };
    if (doc.dimension === "trading_profile") group.trading = doc;
    if (doc.dimension === "fund_flow") group.fundFlow = doc;
    groups.set(key, group);
  }
  return Array.from(groups.values()).sort((a, b) =>
    (a.exchange ?? "").localeCompare(b.exchange ?? ""),
  );
}

function venueTitle(group: VenueGroup): string {
  const name = exchangeDisplayName(group.exchange);
  // Custom labels disambiguate multiple accounts on the same exchange;
  // the default "API key" label adds nothing.
  if (group.label && group.label !== "API key") return `${name} · ${group.label}`;
  return name;
}

export function ContextInsights({ documents }: Props) {
  const venues = groupByVenue(
    documents.filter((d) => d.dimension === "trading_profile" || d.dimension === "fund_flow"),
  );

  if (venues.length === 0) {
    return (
      <section>
        <h2 className="text-lg font-bold text-gray-900 mb-1">Context Insights</h2>
        <p className="text-xs text-gray-400 mb-4">Trading patterns and fund flow analysis</p>
        <div className="glass rounded-xl p-6 text-center">
          <p className="text-sm text-gray-400">
            Context not yet generated. Click &quot;Sync&quot; above to analyze your trading history.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section>
      <h2 className="text-lg font-bold text-gray-900 mb-1">Context Insights</h2>
      <p className="text-xs text-gray-400 mb-4">
        How you trade and move funds, per exchange — fed to AI agents via MCP
      </p>

      <div className="space-y-6">
        {venues.map((venue) => (
          <div key={venue.key}>
            <div className="mb-2.5 flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-md bg-emerald-600/10 text-[10px] font-bold uppercase text-emerald-700">
                {venueTitle(venue).charAt(0)}
              </span>
              <h3 className="text-sm font-semibold text-gray-800">{venueTitle(venue)}</h3>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {venue.trading && <TradingProfileCard doc={venue.trading} />}
              {venue.fundFlow && <FundFlowCard doc={venue.fundFlow} />}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
