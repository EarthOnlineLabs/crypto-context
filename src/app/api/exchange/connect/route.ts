/**
 * POST /api/exchange/connect
 * Connect a new exchange with read-only API key.
 * Validates the key, stores encrypted, fetches initial portfolio.
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { verifyReadOnly, fetchPortfolio, PASSPHRASE_EXCHANGES, type SupportedExchange } from "@/lib/exchange";
import { saveConnection, saveSnapshot } from "@/lib/store";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { exchange, apiKey, secret, password, label } = body as {
    exchange: SupportedExchange;
    apiKey: string;
    secret: string;
    password?: string;
    label?: string;
  };

  // Validate input
  const supported: SupportedExchange[] = [
    "binance", "okx", "bybit", "coinbase",
    "kraken", "bitget", "kucoin", "gateio", "htx", "mexc",
  ];
  if (!supported.includes(exchange)) {
    return NextResponse.json(
      { error: `Unsupported exchange: ${exchange}. Supported: ${supported.join(", ")}` },
      { status: 400 }
    );
  }

  if (!apiKey || !secret) {
    return NextResponse.json(
      { error: "apiKey and secret are required" },
      { status: 400 }
    );
  }

  if (PASSPHRASE_EXCHANGES.includes(exchange) && !password) {
    const name = exchange.toUpperCase();
    return NextResponse.json(
      { error: `${name} requires a passphrase` },
      { status: 400 }
    );
  }

  // Step 1: Verify key is valid and read-only
  const verification = await verifyReadOnly(exchange, {
    apiKey,
    secret,
    password,
  });

  if (!verification.valid) {
    return NextResponse.json(
      { error: verification.error ?? "Invalid API key" },
      { status: 400 }
    );
  }

  // Step 2: Save encrypted connection
  const connectionId = await saveConnection(
    user.id,
    exchange,
    { apiKey, secret, password },
    label ?? `${exchange} account`
  );

  // Step 3: Fetch initial portfolio
  try {
    const snapshot = await fetchPortfolio(exchange, {
      apiKey,
      secret,
      password,
    });
    await saveSnapshot(user.id, connectionId, snapshot);

    return NextResponse.json({
      success: true,
      connectionId,
      portfolio: {
        exchange: snapshot.exchange,
        totalUsdValue: snapshot.totalUsdValue,
        holdingsCount: snapshot.holdings.length,
      },
    });
  } catch (err) {
    // Connection saved but initial fetch failed — that's OK
    return NextResponse.json({
      success: true,
      connectionId,
      portfolio: null,
      warning: "Exchange connected but initial portfolio fetch failed. Will retry.",
    });
  }
}
