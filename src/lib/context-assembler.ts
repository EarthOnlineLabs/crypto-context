/**
 * Shared context assembler — the single source of truth for the user's full
 * crypto context, used by BOTH the MCP endpoint (token auth) and the
 * /api/context/full export endpoint (cookie or token auth).
 *
 * All reads use the Supabase service role (no cookie), so callers must
 * authenticate the user themselves before calling these.
 */

import { createServerClient } from "@supabase/ssr";
import { createHash } from "crypto";
import { decrypt } from "@/lib/crypto";
import {
  fetchPortfolio,
  type SupportedExchange,
  type ExchangeCredentials,
  type PortfolioSnapshot,
} from "@/lib/exchange";
import { fetchWalletPortfolioForChain, type WalletSnapshot } from "@/lib/wallet";
import { generatePortfolioContext, generateFullContext, type ContextDocument } from "@/lib/context";
import { rowToInvestorProfile, type InvestorProfileRow } from "@/lib/store";
import { renderProfileMarkdown } from "@/lib/generators/investor-profile";

/** Service-role client (bypasses RLS). Callers must auth the user first. */
export function createServiceClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } },
  );
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/** Resolve an MCP bearer token → user + permission level (or null if invalid/revoked). */
export async function authenticateMcpToken(
  token: string,
): Promise<{ userId: string; permissionLevel: string } | null> {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("mcp_tokens")
    .select("user_id, permission_level")
    .eq("token_hash", hashToken(token))
    .eq("revoked", false)
    .single();

  if (!data) return null;
  return { userId: data.user_id as string, permissionLevel: data.permission_level as string };
}

/** Per-source budgets: an AI agent is waiting — slow sources must not serialize. */
const EXCHANGE_TIMEOUT_MS = 20_000;
const WALLET_TIMEOUT_MS = 15_000;

/** Resolve to null instead of hanging past the budget. */
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T | null> {
  return Promise.race([
    promise,
    new Promise<null>((resolve) => setTimeout(() => resolve(null), ms)),
  ]);
}

/** Minimal shape check before trusting a stored snapshot as a PortfolioSnapshot. */
function isPortfolioSnapshot(value: unknown): value is PortfolioSnapshot {
  return (
    !!value &&
    typeof value === "object" &&
    typeof (value as PortfolioSnapshot).exchange === "string" &&
    Array.isArray((value as PortfolioSnapshot).holdings)
  );
}

async function fetchAllPortfolios(userId: string): Promise<PortfolioSnapshot[]> {
  const supabase = createServiceClient();
  // Load connections and their last stored snapshots together; snapshots serve as
  // the fallback when a live exchange fetch fails or exceeds its budget. Staleness
  // stays visible to the agent via each snapshot's fetchedAt in the markdown.
  const [{ data: connections }, { data: storedRows }] = await Promise.all([
    supabase.from("connections").select("*").eq("user_id", userId),
    supabase.from("snapshots").select("connection_id, data").eq("user_id", userId),
  ]);
  if (!connections || connections.length === 0) return [];

  const stored = new Map<string, PortfolioSnapshot>();
  for (const row of storedRows ?? []) {
    if (isPortfolioSnapshot(row.data)) stored.set(row.connection_id as string, row.data);
  }

  const results = await Promise.all(
    connections.map((conn) =>
      withTimeout(
        (async () => {
          const credentials: ExchangeCredentials = {
            apiKey: decrypt(conn.encrypted_key),
            secret: decrypt(conn.encrypted_secret),
            password: conn.encrypted_password ? decrypt(conn.encrypted_password) : undefined,
          };
          return fetchPortfolio(conn.exchange as SupportedExchange, credentials);
        })(),
        EXCHANGE_TIMEOUT_MS,
      ).catch((err) => {
        // Never log credentials — exchange name + error type only.
        console.error(
          `[context-assembler] portfolio fetch failed: exchange=${conn.exchange}`,
          err instanceof Error ? err.message : "unknown error",
        );
        return null;
      }),
    ),
  );

  const snapshots: PortfolioSnapshot[] = [];
  for (let i = 0; i < connections.length; i++) {
    const conn = connections[i];
    const live = results[i];
    if (live) {
      snapshots.push(live);
      // Warm the cache (fire-and-forget) so MCP-heavy users always have a fallback.
      void supabase
        .from("snapshots")
        .upsert(
          { user_id: userId, connection_id: conn.id, data: live, created_at: new Date().toISOString() },
          { onConflict: "connection_id" },
        )
        .then(({ error }) => {
          if (error) console.error("[context-assembler] snapshot cache write failed:", error.message);
        });
    } else {
      const cached = stored.get(conn.id as string);
      if (cached) snapshots.push(cached);
    }
  }
  return snapshots;
}

async function fetchAllWallets(userId: string): Promise<WalletSnapshot[]> {
  const supabase = createServiceClient();
  const { data: wallets } = await supabase.from("wallets").select("*").eq("user_id", userId);
  if (!wallets || wallets.length === 0) return [];

  const results = await Promise.all(
    wallets.map((w) =>
      withTimeout(fetchWalletPortfolioForChain(w.address, w.chain), WALLET_TIMEOUT_MS).catch(
        (err) => {
          console.error(
            `[context-assembler] wallet fetch failed: chain=${w.chain}`,
            err instanceof Error ? err.message : "unknown",
          );
          return null;
        },
      ),
    ),
  );

  return results.filter((s): s is WalletSnapshot => s !== null);
}

/** The portfolio snapshot markdown (also the input to the full context). */
export async function assemblePortfolioMd(userId: string): Promise<string> {
  const [snapshots, walletSnapshots] = await Promise.all([
    fetchAllPortfolios(userId),
    fetchAllWallets(userId),
  ]);
  return generatePortfolioContext(snapshots, walletSnapshots);
}

/**
 * The full context: investor profile → notes → portfolio → trading/fund-flow.
 * Pass `portfolioMd` to avoid re-fetching when the caller already has it.
 */
export async function assembleFullContext(userId: string, portfolioMd?: string): Promise<string> {
  const md = portfolioMd ?? (await assemblePortfolioMd(userId));
  const supabase = createServiceClient();

  const [{ data: contextDocs }, { data: profileRow }, { data: notesRow }] = await Promise.all([
    supabase.from("context_documents").select("dimension, content, updated_at").eq("user_id", userId),
    supabase.from("investor_profiles").select("*").eq("user_id", userId).maybeSingle(),
    supabase.from("strategy_notes").select("content").eq("user_id", userId).maybeSingle(),
  ]);

  const docs: ContextDocument[] = (contextDocs ?? []).map((d) => ({
    dimension: d.dimension as string,
    content: d.content as string,
    updated_at: d.updated_at as string,
  }));

  const investorProfileMd = profileRow
    ? renderProfileMarkdown(rowToInvestorProfile(profileRow as InvestorProfileRow))
    : undefined;
  const notesMd = (notesRow?.content as string | undefined) || undefined;

  return generateFullContext(md, docs, investorProfileMd, notesMd);
}

/** Mask dollar amounts for tokens scoped to "anonymized" permission. */
export function applyPermission(text: string, permissionLevel: string): string {
  return permissionLevel === "anonymized" ? text.replace(/\$[\d,]+/g, "$***") : text;
}
