/**
 * MCP Token management.
 * POST: Create a new token
 * GET: List user's tokens
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { randomBytes, createHash } from "crypto";

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { name, permissionLevel } = body as {
    name: string;
    permissionLevel?: "full" | "portfolio_only" | "anonymized";
  };

  if (!name) {
    return NextResponse.json({ error: "Token name is required" }, { status: 400 });
  }

  // Generate a random token
  const rawToken = `cctx_${randomBytes(32).toString("hex")}`;
  const hash = hashToken(rawToken);

  const { error } = await supabase.from("mcp_tokens").insert({
    user_id: user.id,
    token_hash: hash,
    name,
    permission_level: permissionLevel ?? "full",
  });

  if (error) {
    return NextResponse.json(
      { error: `Failed to create token: ${error.message}` },
      { status: 500 }
    );
  }

  // Return the raw token ONCE — it won't be shown again
  return NextResponse.json({
    token: rawToken,
    name,
    permissionLevel: permissionLevel ?? "full",
    message: "Copy this token now — it won't be shown again.",
  });
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("mcp_tokens")
    .select("id, name, permission_level, revoked, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json(
      { error: `Failed to list tokens: ${error.message}` },
      { status: 500 }
    );
  }

  return NextResponse.json({ tokens: data });
}
