"use client";

import { useState } from "react";
import type { McpToken } from "./types";

interface Props {
  tokens: McpToken[];
  hasConnections: boolean;
  onGenerateToken: (name: string, permission: string) => Promise<string | null>;
  onRevokeToken: (id: string) => void;
}

export function McpSection({ tokens, hasConnections, onGenerateToken, onRevokeToken }: Props) {
  const [newToken, setNewToken] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [tokenName, setTokenName] = useState("Claude Code");
  const [tokenPermission, setTokenPermission] = useState("full");
  const [generating, setGenerating] = useState(false);

  async function handleGenerate() {
    setGenerating(true);
    try {
      const token = await onGenerateToken(tokenName, tokenPermission);
      if (token) {
        setNewToken(token);
        setShowForm(false);
      }
    } finally {
      setGenerating(false);
    }
  }

  return (
    <section>
      <h2 className="text-lg font-bold text-gray-900 mb-1">MCP Connection</h2>
      <p className="text-xs text-gray-400 mb-4">Connect your AI tools via Model Context Protocol</p>

      {newToken ? (
        <div className="space-y-3">
          <div className="glass rounded-xl p-4 border-emerald-300">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
              </svg>
              <span className="text-xs text-emerald-700 font-medium">Copy this token now — it won&apos;t be shown again</span>
            </div>
            <code className="block text-sm text-gray-700 bg-gray-50 p-3 rounded-lg break-all font-mono">
              {newToken}
            </code>
          </div>

          <div className="code-block rounded-xl overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-200">
              <span className="w-2.5 h-2.5 rounded-full bg-gray-300" />
              <span className="w-2.5 h-2.5 rounded-full bg-gray-300" />
              <span className="w-2.5 h-2.5 rounded-full bg-gray-300" />
              <span className="ml-2 text-xs text-gray-400 font-mono">terminal</span>
            </div>
            <div className="p-4 font-mono text-sm text-gray-500 leading-relaxed">
              <span className="text-emerald-600">$</span>{" "}
              <span className="text-gray-700">claude mcp add --transport http crypto-ctx</span>
              {typeof window !== "undefined"
                ? ` ${window.location.origin}/api/mcp`
                : " https://your-app.vercel.app/api/mcp"}{" "}
              <span className="text-gray-400">--header</span>{" "}
              <span className="text-gray-700">&quot;Authorization: Bearer</span>{" "}
              <span className="text-emerald-600">{newToken}</span>
              <span className="text-gray-700">&quot;</span>
            </div>
          </div>

          <button
            onClick={() => setNewToken("")}
            className="text-xs text-gray-400 hover:text-gray-700 transition"
          >
            Done
          </button>
        </div>
      ) : showForm ? (
        <div className="glass rounded-xl p-5 space-y-4">
          <div>
            <label className="block text-sm text-gray-500 mb-1.5">Token name</label>
            <input
              type="text"
              value={tokenName}
              onChange={(e) => setTokenName(e.target.value)}
              placeholder="e.g. Claude Code, Cursor, My Agent"
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 transition"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-1.5">Permission level</label>
            <select
              value={tokenPermission}
              onChange={(e) => setTokenPermission(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 transition appearance-none"
            >
              <option value="full">Full — all portfolio data with USD values</option>
              <option value="portfolio_only">Portfolio only — holdings without context</option>
              <option value="anonymized">Anonymized — hide USD values</option>
            </select>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleGenerate}
              disabled={generating || !tokenName.trim()}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition shadow-lg shadow-emerald-200/50 flex items-center gap-2"
            >
              {generating ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Generating...
                </>
              ) : (
                "Generate"
              )}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="text-xs text-gray-400 hover:text-gray-700 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => hasConnections && setShowForm(true)}
          disabled={!hasConnections}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition shadow-lg shadow-emerald-200/50 flex items-center gap-2"
        >
          {!hasConnections ? (
            "Connect a source first"
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              New MCP token
            </>
          )}
        </button>
      )}

      {/* Existing tokens */}
      {tokens.length > 0 && (
        <div className="mt-5">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Tokens</h3>
          <div className="space-y-2">
            {tokens.map((token) => (
              <div
                key={token.id}
                className={`glass rounded-xl p-3.5 flex items-center justify-between group ${token.revoked ? "opacity-50" : ""}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-900">{token.name}</span>
                    <span className="ml-2 text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                      {token.permission_level}
                    </span>
                    {token.revoked && (
                      <span className="ml-2 text-xs text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
                        revoked
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-400">
                    {new Date(token.created_at).toLocaleDateString()}
                  </span>
                  {!token.revoked && (
                    <button
                      onClick={() => onRevokeToken(token.id)}
                      className="text-xs text-gray-300 hover:text-red-500 transition opacity-0 group-hover:opacity-100"
                    >
                      Revoke
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
