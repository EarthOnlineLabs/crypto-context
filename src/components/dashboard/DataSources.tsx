"use client";

import { useState } from "react";
import type { Connection, Wallet } from "./types";
import { ConnectExchangeForm } from "./ConnectExchangeForm";
import { AddWalletForm } from "./AddWalletForm";

const EXCHANGE_ICONS: Record<string, string> = {
  binance: "BN", okx: "OK", bybit: "BY", coinbase: "CB", kraken: "KR",
  bitget: "BG", kucoin: "KC", gateio: "GT", htx: "HT", mexc: "MX",
};

interface Props {
  connections: Connection[];
  wallets: Wallet[];
  onConnectExchange: (data: { exchange: string; apiKey: string; secret: string; password?: string }) => Promise<void>;
  onDisconnectExchange: (id: string) => void;
  onConnectWallet: (data: { address: string; chain: string; label: string }) => Promise<void>;
  onDisconnectWallet: (id: string) => void;
}

export function DataSources({
  connections, wallets,
  onConnectExchange, onDisconnectExchange,
  onConnectWallet, onDisconnectWallet,
}: Props) {
  const [showExchangeForm, setShowExchangeForm] = useState(false);
  const [showWalletForm, setShowWalletForm] = useState(false);

  return (
    <section>
      <h2 className="text-lg font-bold text-gray-900 mb-1">Data Sources</h2>
      <p className="text-xs text-gray-400 mb-4">Exchanges and wallets feeding your context</p>

      {/* Exchanges */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-500">Exchanges</h3>
          {!showExchangeForm && (
            <button
              onClick={() => setShowExchangeForm(true)}
              className="px-3 py-1.5 text-xs bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Connect
            </button>
          )}
        </div>

        {showExchangeForm && (
          <div className="mb-3">
            <ConnectExchangeForm
              onConnect={async (data) => {
                await onConnectExchange(data);
                setShowExchangeForm(false);
              }}
              onCancel={() => setShowExchangeForm(false)}
            />
          </div>
        )}

        {connections.length === 0 && !showExchangeForm ? (
          <div className="glass rounded-xl p-6 text-center">
            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center mx-auto">
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.86-2.06a4.5 4.5 0 00-6.364-6.364L4.5 8.25a4.5 4.5 0 006.364 6.364l2.382-2.382" />
              </svg>
            </div>
            <p className="mt-3 text-sm text-gray-500">No exchanges connected</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {connections.map((c) => (
              <div
                key={c.id}
                className="glass rounded-xl p-4 flex items-center justify-between group hover:border-gray-300 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold text-sm">
                    {EXCHANGE_ICONS[c.exchange] ?? c.exchange[0].toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium capitalize text-sm text-gray-900">{c.exchange}</span>
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span className="text-xs text-emerald-600">Active</span>
                      </span>
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {c.label} &middot; {new Date(c.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => onDisconnectExchange(c.id)}
                  className="text-xs text-gray-300 hover:text-red-500 transition opacity-0 group-hover:opacity-100"
                >
                  Disconnect
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Wallets */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-500">Wallets</h3>
          {!showWalletForm && (
            <button
              onClick={() => setShowWalletForm(true)}
              className="px-3 py-1.5 text-xs bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Add wallet
            </button>
          )}
        </div>

        {showWalletForm && (
          <div className="mb-3">
            <AddWalletForm
              onConnect={async (data) => {
                await onConnectWallet(data);
                setShowWalletForm(false);
              }}
              onCancel={() => setShowWalletForm(false)}
            />
          </div>
        )}

        {wallets.length === 0 && !showWalletForm ? (
          <div className="glass rounded-xl p-6 text-center">
            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center mx-auto">
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
              </svg>
            </div>
            <p className="mt-3 text-sm text-gray-500">No wallets tracked</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {wallets.map((w) => (
              <div
                key={w.id}
                className="glass rounded-xl p-4 flex items-center justify-between group hover:border-gray-300 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold text-xs">
                    {w.chain.slice(0, 3).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-gray-900 font-mono">
                        {w.address.slice(0, 6)}...{w.address.slice(-4)}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span className="text-xs text-emerald-600">Active</span>
                      </span>
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      <span className="capitalize">{w.chain}</span>
                      {w.label && <> &middot; {w.label}</>}
                      {" "}&middot; {new Date(w.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => onDisconnectWallet(w.id)}
                  className="text-xs text-gray-300 hover:text-red-500 transition opacity-0 group-hover:opacity-100"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
