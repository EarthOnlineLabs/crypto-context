/**
 * GET /api/exchange/portfolio
 * Fetch fresh portfolio for the authenticated user.
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getConnections, getConnectionCredentials, saveSnapshot, getWallets } from "@/lib/store";
import { fetchPortfolio, type PortfolioSnapshot } from "@/lib/exchange";
import { fetchWalletPortfolio, type WalletSnapshot } from "@/lib/wallet";
import type { SupportedChain } from "@/lib/chains";
import { generatePortfolioContext } from "@/lib/context";
import {
  checkRateLimit,
  RATE_LIMITS,
  getClientIp,
  sanitizeExchangeError,
} from "@/lib/security";

/** Portfolio fetch can be slow for users with many assets across exchanges */
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  // Rate limiting
  const ip = getClientIp(request.headers);
  const rateLimit = checkRateLimit(
    ip,
    "exchange/portfolio",
    RATE_LIMITS.portfolioFetch.maxRequests,
    RATE_LIMITS.portfolioFetch.windowMs
  );
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment." },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((rateLimit.resetAt - Date.now()) / 1000)),
        },
      }
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [connections, wallets] = await Promise.all([
    getConnections(user.id),
    getWallets(user.id),
  ]);

  if (connections.length === 0 && wallets.length === 0) {
    return NextResponse.json({
      snapshots: [],
      walletSnapshots: [],
      context: "# Portfolio\n\nNo exchanges or wallets connected yet.",
      totalUsdValue: 0,
    });
  }

  const errors: { source: string; error: string }[] = [];

  // Fetch ALL exchange + wallet portfolios in parallel
  const exchangePromises = connections.map(async (conn) => {
    const creds = await getConnectionCredentials(conn.id, user.id);
    if (!creds) return null;
    try {
      const snapshot = await fetchPortfolio(creds.exchange, creds.credentials);
      await saveSnapshot(user.id, conn.id, snapshot);
      return snapshot;
    } catch (err) {
      const rawMessage = err instanceof Error ? err.message : String(err);
      console.error(`[portfolio] Failed to fetch ${conn.exchange}: ${rawMessage}`);
      errors.push({
        source: conn.exchange,
        error: sanitizeExchangeError(rawMessage, conn.exchange),
      });
      return null;
    }
  });

  const walletPromises = wallets.map(async (w) => {
    try {
      return await fetchWalletPortfolio(
        w.address as `0x${string}`,
        w.chain as SupportedChain
      );
    } catch (err) {
      console.error(
        `[portfolio] Wallet fetch failed: chain=${w.chain}`,
        err instanceof Error ? err.message : "unknown"
      );
      errors.push({
        source: `${w.chain}:${w.address.slice(0, 10)}...`,
        error: "Failed to fetch wallet balances",
      });
      return null;
    }
  });

  const [exchangeResults, walletResults] = await Promise.all([
    Promise.all(exchangePromises),
    Promise.all(walletPromises),
  ]);

  const snapshots = exchangeResults.filter((s): s is PortfolioSnapshot => s !== null);
  const walletSnapshots = walletResults.filter((s): s is WalletSnapshot => s !== null);

  const context = generatePortfolioContext(snapshots, walletSnapshots);
  const totalUsdValue =
    snapshots.reduce((sum, s) => sum + s.totalUsdValue, 0) +
    walletSnapshots.reduce((sum, s) => sum + s.totalUsdValue, 0);

  return NextResponse.json({
    snapshots: snapshots.map((s) => ({
      exchange: s.exchange,
      totalUsdValue: s.totalUsdValue,
      holdingsCount: s.holdings.length,
      fetchedAt: s.fetchedAt,
    })),
    walletSnapshots: walletSnapshots.map((s) => ({
      address: s.address,
      chain: s.chain,
      totalUsdValue: s.totalUsdValue,
      holdingsCount: s.holdings.length,
      fetchedAt: s.fetchedAt,
    })),
    context,
    totalUsdValue,
    errors: errors.length > 0 ? errors : undefined,
  });
}
