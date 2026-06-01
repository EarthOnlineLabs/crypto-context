"use client";

import { useState } from "react";
import { useDashboard } from "./DashboardProvider";
import { Button, Card, CopyButton, SectionHeader } from "@/components/ui";

/** Stable production endpoint the downloadable skill points at. */
const ENDPOINT = "https://cryptocontext.aiself.site/api/context/full";

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

export function ContextExport() {
  const { getFullContext, hasActiveToken } = useDashboard();
  const [context, setContext] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadContext() {
    setLoading(true);
    const md = await getFullContext();
    setContext(md);
    setLoading(false);
  }

  function downloadSkill() {
    const blob = new Blob([buildSkillMd()], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "SKILL.md";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
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
              <pre className="mt-3 flex-1 max-h-48 overflow-auto rounded-lg bg-gray-50 border border-gray-200 p-3 text-[11px] leading-relaxed text-gray-600 whitespace-pre-wrap font-mono">
                {context.slice(0, 1200)}
                {context.length > 1200 ? "\n…" : ""}
              </pre>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-gray-400">
                  ~{tokenEst.toLocaleString()} tokens · {context.length.toLocaleString()} chars
                </span>
                <CopyButton value={context} label="Copy context" />
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
                <Button size="sm" onClick={downloadSkill}>
                  Download SKILL.md
                </Button>
                <p className="mt-2.5 text-xs text-gray-400 leading-relaxed">
                  Then set <code className="font-mono text-gray-600">CRYPTO_CONTEXT_TOKEN</code> to a
                  token from the section above — the skill keeps your token out of the file.
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
