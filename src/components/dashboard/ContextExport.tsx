"use client";

import { useState } from "react";
import { useDashboard } from "./DashboardProvider";
import { Button, Card, CopyButton, SectionHeader } from "@/components/ui";

/** Stable production endpoint the downloadable skill points at. */
const ENDPOINT = "https://cryptocontext.earthonline.site/api/context/full";

function buildSkillMd(): string {
  return `---
name: crypto-context
description: Fetches the user's live crypto portfolio, AI-generated investor profile, and their own strategy notes from CryptoContext. Use whenever the user asks about their crypto holdings, portfolio, risk, allocation, or investment strategy.
---

# CryptoContext

Loads the user's full crypto context — holdings across every connected exchange and
wallet, a holistic investor profile, the user's own strategy notes, and trading /
fund-flow patterns — so you can advise them grounded in their *actual* positions.

## How to use

When the user asks anything about their crypto portfolio, holdings, risk, or strategy,
fetch their current context first:

\`\`\`bash
curl -s ${ENDPOINT} \\
  -H "Authorization: Bearer $CRYPTO_CONTEXT_TOKEN"
\`\`\`

It returns markdown. Read it, then answer grounded in the user's real positions and
stated strategy. Never invent numbers — every figure comes from the response.

## Setup (one time)

Get your token from the CryptoContext dashboard → Connect, then expose it to your agent:

\`\`\`bash
export CRYPTO_CONTEXT_TOKEN="paste-your-token-here"
\`\`\`

Works in Claude Code, Claude.ai, and OpenClaw (all read \`SKILL.md\` directories).
`;
}

/**
 * What the assembled context contains, derived from its section headers — shown
 * as a checklist so users can verify nothing is missing before they copy.
 */
interface SectionInventory {
  notes: boolean;
  profile: boolean;
  portfolio: boolean;
  tradingVenues: number;
  fundFlowVenues: number;
}

function inventory(md: string): SectionInventory {
  return {
    notes: md.includes("# Investor Notes"),
    profile: md.includes("# Investor Profile"),
    portfolio: md.includes("# Portfolio"),
    tradingVenues: (md.match(/^# Trading Profile — /gm) ?? []).length,
    fundFlowVenues: (md.match(/^# Fund Flow — /gm) ?? []).length,
  };
}

function SectionChip({ label, present }: { label: string; present: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${
        present
          ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20"
          : "bg-gray-50 text-gray-400 ring-gray-300/40"
      }`}
    >
      {present ? (
        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
      ) : (
        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
        </svg>
      )}
      {label}
    </span>
  );
}

export function ContextExport() {
  const { getFullContext, hasActiveToken } = useDashboard();
  const [context, setContext] = useState("");
  const [loading, setLoading] = useState(false);
  const [building, setBuilding] = useState(false);

  async function loadContext() {
    setLoading(true);
    const md = await getFullContext();
    setContext(md);
    setLoading(false);
  }

  async function downloadSkill() {
    setBuilding(true);
    try {
      // A skill is a named directory (crypto-context/SKILL.md), so download an
      // installable package rather than a bare SKILL.md. jszip is lazy-loaded.
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();
      zip.file("crypto-context/SKILL.md", buildSkillMd());
      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "crypto-context.zip";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } finally {
      setBuilding(false);
    }
  }

  const tokenEst = Math.max(1, Math.round(context.length / 4));

  return (
    <section className="mt-8">
      <SectionHeader
        title="Use it anywhere"
        description="Beyond MCP — copy your full context into any AI, or install it as a portable skill."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Copy-paste */}
        <Card className="p-5 flex flex-col">
          <h3 className="font-semibold text-gray-900">Copy full context</h3>
          <p className="mt-1 text-sm text-gray-500 leading-relaxed">
            Paste into ChatGPT, OpenClaw, Gemini — any chat. Zero setup, no token.
          </p>

          {context ? (
            <>
              {(() => {
                const inv = inventory(context);
                return (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <SectionChip label="Your notes" present={inv.notes} />
                    <SectionChip label="Investor profile" present={inv.profile} />
                    <SectionChip label="Portfolio" present={inv.portfolio} />
                    <SectionChip
                      label={`Trading (${inv.tradingVenues} venue${inv.tradingVenues === 1 ? "" : "s"})`}
                      present={inv.tradingVenues > 0}
                    />
                    <SectionChip
                      label={`Fund flow (${inv.fundFlowVenues} venue${inv.fundFlowVenues === 1 ? "" : "s"})`}
                      present={inv.fundFlowVenues > 0}
                    />
                  </div>
                );
              })()}
              <pre className="mt-3 flex-1 max-h-64 overflow-auto rounded-lg bg-gray-50 border border-gray-200 p-3 text-[11px] leading-relaxed text-gray-600 whitespace-pre-wrap font-mono">
                {context}
              </pre>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-gray-400">
                  ~{tokenEst.toLocaleString()} tokens · everything above is copied
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={loadContext}
                    disabled={loading}
                    className="text-xs text-gray-400 hover:text-gray-600 transition disabled:opacity-50"
                  >
                    {loading ? "Refreshing…" : "Refresh"}
                  </button>
                  <CopyButton value={context} label="Copy context" />
                </div>
              </div>
            </>
          ) : (
            <div className="mt-4">
              <Button size="sm" onClick={loadContext} loading={loading}>
                {loading ? "Loading…" : "Load my context"}
              </Button>
            </div>
          )}
        </Card>

        {/* Portable skill */}
        <Card className="p-5 flex flex-col">
          <h3 className="font-semibold text-gray-900">Portable skill</h3>
          <p className="mt-1 text-sm text-gray-500 leading-relaxed">
            A <code className="text-xs font-mono text-gray-700">SKILL.md</code> for Claude Code,
            Claude.ai, and OpenClaw — it fetches your live context on demand.
          </p>

          <div className="mt-4 flex-1 flex flex-col justify-end">
            {hasActiveToken ? (
              <>
                <Button size="sm" onClick={downloadSkill} loading={building}>
                  Download skill (.zip)
                </Button>
                <p className="mt-2.5 text-xs text-gray-400 leading-relaxed">
                  Unzip <code className="font-mono text-gray-600">crypto-context.zip</code> into your
                  skills folder (e.g. <code className="font-mono text-gray-600">~/.claude/skills/</code>),
                  then set <code className="font-mono text-gray-600">CRYPTO_CONTEXT_TOKEN</code> to a
                  token from above — the skill keeps your token out of the file.
                </p>
              </>
            ) : (
              <p className="text-xs text-gray-400 leading-relaxed">
                Generate an access token above first — the skill uses it to fetch your context.
              </p>
            )}
          </div>
        </Card>
      </div>

      {/* Per-platform pointers */}
      <Card className="mt-4 p-4 text-xs text-gray-500 leading-relaxed">
        <span className="font-medium text-gray-700">Connecting a specific AI?</span>{" "}
        <span className="text-gray-600">Claude Code / Cursor</span> — use the one-line MCP command
        above. <span className="text-gray-600">ChatGPT</span> (Pro/Plus) — add a custom MCP connector
        in Developer Mode pointing at <code className="font-mono">…/api/mcp</code> with your token.{" "}
        <span className="text-gray-600">OpenClaw / any other AI</span> — drop in the skill, or just
        paste the context.
      </Card>
    </section>
  );
}
