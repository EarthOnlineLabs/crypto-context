"use client";

import { useState } from "react";
import { Alert, Button, Field, Input, Select, Spinner } from "@/components/ui";
import { PICKER_WALLET_BRANDS, getChainBrand, type BrandStyle } from "@/lib/wallets/brands";
import { BrandLogo } from "@/components/icons/BrandLogo";
import { cn } from "@/lib/cn";

const EVM_CHAINS = [
  "ethereum",
  "bsc",
  "polygon",
  "arbitrum",
  "base",
  "optimism",
  "avalanche",
] as const;

const ALL_CHAINS = [...EVM_CHAINS, "solana"] as const;

const EVM_RE = /^0x[0-9a-fA-F]{40}$/;
const SOLANA_RE = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

interface ChainScan {
  chain: string;
  ok: boolean;
  totalUsdValue: number;
  holdingsCount: number;
}

export interface WalletInput {
  address: string;
  chain: string;
  label: string;
  brand?: string;
}

interface Props {
  /** Batch add — one MetaMask address can become several chain rows. */
  onConnect: (items: WalletInput[]) => Promise<void>;
  onCancel: () => void;
}

const EyeIcon = (
  <svg className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

function ReadOnlyNote() {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 border border-gray-200">
      {EyeIcon}
      <p className="text-xs text-gray-500 leading-relaxed">
        <span className="text-gray-700 font-medium">Read-only:</span> we only read public on-chain
        balances. No private keys, no signatures — just the address.
      </p>
    </div>
  );
}

function fmtUsd(v: number): string {
  if (v >= 1000) return `$${(v / 1000).toFixed(1)}k`;
  if (v >= 1) return `$${v.toFixed(0)}`;
  if (v > 0) return `<$1`;
  return "$0";
}

export function AddWalletForm({ onConnect, onCancel }: Props) {
  const [brand, setBrand] = useState<BrandStyle | null>(null);
  const [manualMode, setManualMode] = useState(false);

  const [evmAddress, setEvmAddress] = useState("");
  const [solAddress, setSolAddress] = useState("");
  const [label, setLabel] = useState("");

  // Manual ("Other") mode keeps the original chain+address path.
  const [manualChain, setManualChain] = useState("ethereum");
  const [manualAddress, setManualAddress] = useState("");

  const [scanning, setScanning] = useState(false);
  const [scan, setScan] = useState<ChainScan[] | null>(null);
  const [selectedChains, setSelectedChains] = useState<Set<string>>(new Set());

  const [error, setError] = useState("");
  const [connecting, setConnecting] = useState(false);

  const ecosystem = brand?.ecosystem ?? "multi";
  const wantsEvm = manualMode ? false : ecosystem === "evm" || ecosystem === "multi";
  const wantsSolana = manualMode ? false : ecosystem === "solana" || ecosystem === "multi";

  function reset(toBrand: BrandStyle | null, manual = false) {
    setBrand(toBrand);
    setManualMode(manual);
    setError("");
    setScan(null);
    setSelectedChains(new Set());
    setEvmAddress("");
    setSolAddress("");
  }

  async function runScan() {
    const addr = evmAddress.trim();
    if (!EVM_RE.test(addr)) {
      setError("Invalid EVM address (0x…)");
      return;
    }
    setError("");
    setScanning(true);
    setScan(null);
    try {
      const res = await fetch("/api/wallet/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: addr }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(
          res.status === 401
            ? "Balance scan needs a signed-in account"
            : (data?.error ?? "Scan failed"),
        );
      }
      const data = (await res.json()) as { chains: ChainScan[] };
      setScan(data.chains);
      // Preselect every chain where the address actually holds something.
      const withValue = data.chains.filter((c) => c.ok && (c.totalUsdValue > 0 || c.holdingsCount > 0));
      setSelectedChains(new Set((withValue.length > 0 ? withValue : data.chains.filter((c) => c.chain === "ethereum")).map((c) => c.chain)));
    } catch (err) {
      // Scan is a convenience — fall back to manual chain selection.
      setScan(EVM_CHAINS.map((chain) => ({ chain, ok: false, totalUsdValue: 0, holdingsCount: 0 })));
      setSelectedChains(new Set(["ethereum"]));
      setError(err instanceof Error ? `${err.message} — pick chains manually below.` : "Scan failed — pick chains manually below.");
    } finally {
      setScanning(false);
    }
  }

  function toggleChain(chain: string) {
    setSelectedChains((prev) => {
      const next = new Set(prev);
      if (next.has(chain)) next.delete(chain);
      else next.add(chain);
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const items: WalletInput[] = [];
    const trimmedLabel = label.trim();

    if (manualMode) {
      const addr = manualAddress.trim();
      const isSol = manualChain === "solana";
      if (!(isSol ? SOLANA_RE : EVM_RE).test(addr)) {
        setError(isSol ? "Invalid Solana address" : "Invalid EVM address");
        return;
      }
      items.push({ address: addr, chain: manualChain, label: trimmedLabel });
    } else {
      const evm = evmAddress.trim();
      const sol = solAddress.trim();

      if (wantsEvm && evm) {
        if (!EVM_RE.test(evm)) {
          setError("Invalid EVM address (0x…)");
          return;
        }
        if (selectedChains.size === 0) {
          setError("Scan the address (or pick at least one chain) first.");
          return;
        }
        for (const chain of EVM_CHAINS) {
          if (selectedChains.has(chain)) {
            items.push({ address: evm, chain, label: trimmedLabel, brand: brand?.id });
          }
        }
      }
      if (wantsSolana && sol) {
        if (!SOLANA_RE.test(sol)) {
          setError("Invalid Solana address");
          return;
        }
        items.push({ address: sol, chain: "solana", label: trimmedLabel, brand: brand?.id });
      }
      if (items.length === 0) {
        setError(
          ecosystem === "solana"
            ? "Paste your Solana address."
            : ecosystem === "evm"
              ? "Paste your wallet address and scan it."
              : "Paste at least one address (EVM or Solana)."
        );
        return;
      }
    }

    setConnecting(true);
    try {
      await onConnect(items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add wallet");
    } finally {
      setConnecting(false);
    }
  }

  // ---------- Step 1: which wallet do you use? ----------
  if (!brand && !manualMode) {
    return (
      <div className="glass rounded-xl p-5">
        <p className="text-sm font-medium text-gray-700 mb-1">Which wallet do you use?</p>
        <p className="text-xs text-gray-400 mb-4">
          We only ever read public balances from the address — pick your app so your sources stay recognizable.
        </p>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {PICKER_WALLET_BRANDS.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => reset(b)}
              className="flex flex-col items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2 py-3 text-xs text-gray-700 transition hover:border-emerald-400 hover:bg-emerald-50/40"
            >
              <BrandLogo id={b.id} size={30} />
              <span className="truncate max-w-full">{b.name}</span>
            </button>
          ))}
          <button
            type="button"
            onClick={() => reset(null, true)}
            className="flex flex-col items-center gap-1.5 rounded-lg border border-dashed border-gray-300 bg-white px-2 py-3 text-xs text-gray-500 transition hover:border-emerald-400 hover:text-gray-700"
          >
            <span className="flex h-[30px] w-[30px] items-center justify-center rounded-[7px] bg-gray-100 text-gray-400">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </span>
            Other address
          </button>
        </div>
        <div className="mt-4 flex justify-end">
          <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  // ---------- Step 2: addresses ----------
  return (
    <form onSubmit={handleSubmit} className="glass rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {manualMode ? (
            <span className="text-sm font-medium text-gray-700">Add by address</span>
          ) : (
            <>
              <BrandLogo id={brand!.id} size={26} />
              <span className="text-sm font-medium text-gray-700">{brand!.name}</span>
            </>
          )}
        </div>
        <button
          type="button"
          onClick={() => reset(null)}
          className="text-xs text-gray-400 hover:text-gray-600 transition"
        >
          ← Change wallet
        </button>
      </div>

      {manualMode ? (
        <>
          <Field label="Chain">
            <Select value={manualChain} onChange={(e) => setManualChain(e.target.value)}>
              {ALL_CHAINS.map((c) => (
                <option key={c} value={c}>
                  {getChainBrand(c).name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Address">
            <Input
              type="text"
              value={manualAddress}
              onChange={(e) => setManualAddress(e.target.value)}
              required
              placeholder={manualChain === "solana" ? "Base58 address…" : "0x…"}
              className="font-mono"
            />
          </Field>
        </>
      ) : (
        <>
          {wantsEvm && (
            <Field
              label={ecosystem === "multi" ? "EVM address" : "Wallet address"}
              hint={ecosystem === "multi" ? "(optional)" : undefined}
            >
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={evmAddress}
                  onChange={(e) => {
                    setEvmAddress(e.target.value);
                    setScan(null);
                    setSelectedChains(new Set());
                  }}
                  placeholder="0x…"
                  className="font-mono flex-1"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={runScan}
                  disabled={scanning || !evmAddress.trim()}
                >
                  {scanning ? (
                    <span className="flex items-center gap-1.5">
                      <Spinner size="sm" /> Scanning…
                    </span>
                  ) : (
                    "Scan chains"
                  )}
                </Button>
              </div>
            </Field>
          )}

          {/* One address, every chain it lives on — the point of brand-first import. */}
          {wantsEvm && scan && (
            <div className="rounded-lg border border-gray-200 bg-white/60 p-3">
              <p className="text-xs text-gray-500 mb-2">
                One address works across all EVM chains — we found balances on the pre-checked ones:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {scan.map((c) => {
                  const checked = selectedChains.has(c.chain);
                  const hasValue = c.ok && (c.totalUsdValue > 0 || c.holdingsCount > 0);
                  return (
                    <button
                      key={c.chain}
                      type="button"
                      onClick={() => toggleChain(c.chain)}
                      className={cn(
                        "flex items-center gap-2 rounded-lg border px-2.5 py-2 text-left text-xs transition",
                        checked
                          ? "border-emerald-500/60 bg-emerald-50/70"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      )}
                    >
                      <BrandLogo id={c.chain} size={20} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium text-gray-800">
                          {getChainBrand(c.chain).name}
                        </span>
                        <span className={cn("block", hasValue ? "text-emerald-600" : "text-gray-400")}>
                          {c.ok ? fmtUsd(c.totalUsdValue) : "—"}
                        </span>
                      </span>
                      <span
                        className={cn(
                          "flex h-4 w-4 items-center justify-center rounded border",
                          checked ? "border-emerald-600 bg-emerald-600 text-white" : "border-gray-300 bg-white"
                        )}
                      >
                        {checked && (
                          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {wantsSolana && (
            <Field label="Solana address" hint={ecosystem === "multi" ? "(optional)" : undefined}>
              <Input
                type="text"
                value={solAddress}
                onChange={(e) => setSolAddress(e.target.value)}
                placeholder="Base58 address…"
                className="font-mono"
              />
            </Field>
          )}
        </>
      )}

      <Field label="Label" hint="(optional)">
        <Input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="e.g. Main wallet, DeFi wallet"
        />
      </Field>

      <ReadOnlyNote />

      {error && <Alert tone="error">{error}</Alert>}

      <div className="flex items-center gap-3">
        <Button type="submit" loading={connecting}>
          {connecting
            ? "Adding…"
            : !manualMode && wantsEvm && selectedChains.size > 1
              ? `Add wallet (${selectedChains.size} chains)`
              : "Add wallet"}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
