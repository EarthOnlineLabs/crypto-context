"use client";

import type { PortfolioData } from "./types";

interface Props {
  portfolio: PortfolioData;
  syncing: boolean;
  contextSyncing: boolean;
  onSync: () => void;
}

function formatUsd(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

export function PortfolioSummary({ portfolio, syncing, contextSyncing, onSync }: Props) {
  const sourceCount =
    portfolio.snapshots.length + (portfolio.walletSnapshots?.length ?? 0);

  const stats = [
    {
      label: "Total Value",
      value: formatUsd(portfolio.totalUsdValue),
      detail: `across ${sourceCount} source${sourceCount !== 1 ? "s" : ""}`,
    },
    {
      label: "Assets",
      value: String(portfolio.holdings.length),
      detail: portfolio.holdings.length > 0
        ? `top: ${portfolio.holdings[0].asset} (${portfolio.holdings[0].allocation}%)`
        : "none tracked",
    },
    {
      label: "Exchanges",
      value: String(portfolio.snapshots.length),
      detail: portfolio.snapshots.map((s) => s.exchange).join(", ") || "none",
    },
    {
      label: "Wallets",
      value: String(portfolio.walletSnapshots?.length ?? 0),
      detail: portfolio.walletSnapshots?.map((w) => w.chain).join(", ") || "none",
    },
  ];

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Portfolio</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Live data from your connected sources
          </p>
        </div>
        <div className="flex items-center gap-3">
          {contextSyncing && (
            <span className="text-xs text-gray-400 flex items-center gap-1.5">
              <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Syncing context...
            </span>
          )}
          <button
            onClick={onSync}
            disabled={syncing}
            className="px-3 py-1.5 text-xs border border-gray-200 hover:border-gray-400 rounded-lg text-gray-400 hover:text-gray-700 disabled:opacity-50 transition flex items-center gap-2"
          >
            {syncing ? (
              <>
                <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Syncing...
              </>
            ) : (
              <>
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
                </svg>
                Sync
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="glass rounded-xl p-4">
            <div className="text-xs text-gray-400 mb-1">{s.label}</div>
            <div className="text-xl font-bold text-gray-900">{s.value}</div>
            <div className="text-xs text-gray-400 mt-1 truncate capitalize">{s.detail}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
