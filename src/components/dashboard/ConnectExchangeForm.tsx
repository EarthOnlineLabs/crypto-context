"use client";

import { useState } from "react";

const EXCHANGES = [
  { id: "binance", name: "Binance" },
  { id: "okx", name: "OKX" },
  { id: "bybit", name: "Bybit" },
  { id: "coinbase", name: "Coinbase" },
  { id: "kraken", name: "Kraken" },
  { id: "bitget", name: "Bitget" },
  { id: "kucoin", name: "KuCoin" },
  { id: "gateio", name: "Gate.io" },
  { id: "htx", name: "HTX" },
  { id: "mexc", name: "MEXC" },
];

const PASSPHRASE_EXCHANGES = ["okx", "bitget", "kucoin"];

interface Props {
  onConnect: (data: {
    exchange: string;
    apiKey: string;
    secret: string;
    password?: string;
  }) => Promise<void>;
  onCancel: () => void;
}

export function ConnectExchangeForm({ onConnect, onCancel }: Props) {
  const [exchange, setExchange] = useState("binance");
  const [apiKey, setApiKey] = useState("");
  const [secret, setSecret] = useState("");
  const [passphrase, setPassphrase] = useState("");
  const [error, setError] = useState("");
  const [connecting, setConnecting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setConnecting(true);

    try {
      await onConnect({
        exchange,
        apiKey,
        secret,
        password: PASSPHRASE_EXCHANGES.includes(exchange) ? passphrase : undefined,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connection failed");
    } finally {
      setConnecting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="glass rounded-xl p-5 space-y-4">
      <div>
        <label className="block text-sm text-gray-500 mb-1.5">Exchange</label>
        <select
          value={exchange}
          onChange={(e) => setExchange(e.target.value)}
          className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 transition appearance-none"
        >
          {EXCHANGES.map((ex) => (
            <option key={ex.id} value={ex.id}>{ex.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm text-gray-500 mb-1.5">
          API Key <span className="text-gray-300">(read-only)</span>
        </label>
        <input
          type="text"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          required
          autoComplete="off"
          placeholder="Your read-only API key"
          className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 transition"
        />
      </div>
      <div>
        <label className="block text-sm text-gray-500 mb-1.5">API Secret</label>
        <input
          type="password"
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
          required
          autoComplete="new-password"
          placeholder="Your API secret"
          className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 transition"
        />
      </div>
      {PASSPHRASE_EXCHANGES.includes(exchange) && (
        <div>
          <label className="block text-sm text-gray-500 mb-1.5">Passphrase</label>
          <input
            type="password"
            value={passphrase}
            onChange={(e) => setPassphrase(e.target.value)}
            required
            placeholder={`${exchange.toUpperCase()} API passphrase`}
            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 transition"
          />
        </div>
      )}

      <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 border border-gray-200">
        <svg className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
        </svg>
        <p className="text-xs text-gray-500 leading-relaxed">
          <span className="text-gray-700 font-medium">Security:</span>{" "}
          Only provide a read-only API key. We verify permissions before accepting.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
          <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={connecting}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition shadow-lg shadow-emerald-200/50"
        >
          {connecting ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Verifying...
            </span>
          ) : (
            "Connect"
          )}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="text-xs text-gray-400 hover:text-gray-700 transition"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
