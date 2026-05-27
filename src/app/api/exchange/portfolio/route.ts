/**
 * GET /api/exchange/portfolio
 * Fetch fresh portfolio for the authenticated user.
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getConnections, getConnectionCredentials, saveSnapshot } from "@/lib/store";
import { fetchPortfolio, type PortfolioSnapshot } from "@/lib/exchange";
import { generatePortfolioContext } from "@/lib/context";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const connections = await getConnections(user.id);

  if (connections.length === 0) {
    return NextResponse.json({
      snapshots: [],
      context: "# Portfolio\n\nNo exchanges connected yet.",
      totalUsdValue: 0,
    });
  }

  const snapshots: PortfolioSnapshot[] = [];
  const errors: { exchange: string; error: string }[] = [];

  for (const conn of connections) {
    const creds = await getConnectionCredentials(conn.id, user.id);
    if (!creds) continue;

    try {
      const snapshot = await fetchPortfolio(
        creds.exchange,
        creds.credentials
      );
      snapshots.push(snapshot);
      await saveSnapshot(user.id, conn.id, snapshot);
    } catch (err) {
      errors.push({
        exchange: conn.exchange,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  const context = generatePortfolioContext(snapshots);
  const totalUsdValue = snapshots.reduce(
    (sum, s) => sum + s.totalUsdValue,
    0
  );

  return NextResponse.json({
    snapshots: snapshots.map((s) => ({
      exchange: s.exchange,
      totalUsdValue: s.totalUsdValue,
      holdingsCount: s.holdings.length,
      fetchedAt: s.fetchedAt,
    })),
    context,
    totalUsdValue,
    errors: errors.length > 0 ? errors : undefined,
  });
}
