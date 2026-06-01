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

async function fetchAllPortfolios(userId: string): Promise<PortfolioSnapshot[]> {
  const supabase = createServiceClient();
  const { data: connections } = await supabase.from("connections").select("*").eq("user_id", userId);
  if (!connections || connections.length === 0) return [];

  const snapshots: PortfolioSnapshot[] = [];
  for (const conn of connections) {
    try {
      const credentials: ExchangeCredentials = {
        apiKey: decrypt(conn.encrypted_key),
        secret: decrypt(conn.encrypted_secret),
        password: conn.encrypted_password ? decrypt(conn.encrypted_password) : undefined,
      };
      snapshots.push(await fetchPortfolio(conn.exchange as SupportedExchange, credentials));
    } catch (err) {
      // Never log credentials — exchange name + error type only.
      console.error(
        `[context-assembler] portfolio fetch failed: exchange=${conn.exchange}`,
        err instanceof Error ? err.message : "unknown error",
      );
    }
  }
  return snapshots;
}

async function fetchAllWallets(userId: string): Promise<WalletSnapshot[]> {
  const supabase = createServiceClient();
  const { data: wallets } = await supabase.from("wallets").select("*").eq("user_id", userId);
  if (!wallets || wallets.length === 0) return [];

  const snapshots: WalletSnapshot[] = [];
  for (const w of wallets) {
    try {
      snapshots.push(await fetchWalletPortfolioForChain(w.address, w.chain));
    } catch (err) {
      console.error(
        `[context-assembler] wallet fetch failed: chain=${w.chain}`,
        err instanceof Error ? err.message : "unknown",
      );
    }
  }
  return snapshots;
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
