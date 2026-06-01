"use client";

import { useEffect, useRef, useState } from "react";
import { useDashboard } from "./DashboardProvider";
import { Button, Card, SectionHeader, Textarea } from "@/components/ui";

const MAX = 20_000;

const PLACEHOLDER = `Write your investment thesis, rules, and ideas — in your own words. For example:

• Core thesis: ETH as the long-term anchor; BTC as a macro hedge.
• Rules: only add on 20%+ dips; never chase pumps; keep ≥10% in stables.
• Watching: L2 governance tokens, restaking, RWA.
• Ideas to try: rotate a small sleeve into SOL DeFi; trim memecoins.

Every connected AI reads this — so you never have to re-explain yourself.`;

const InfoIcon = (
  <svg className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
  </svg>
);

export function NotesSection() {
  const { notes, notesSaving, saveNotes } = useDashboard();
  const [draft, setDraft] = useState(notes);
  const [dirty, setDirty] = useState(false);
  const lastSaved = useRef(notes);

  // Sync when the provider's notes load/refresh and the user hasn't started editing.
  useEffect(() => {
    if (!dirty) {
      setDraft(notes);
      lastSaved.current = notes;
    }
  }, [notes, dirty]);

  // Debounced autosave.
  useEffect(() => {
    if (!dirty) return;
    const t = setTimeout(() => {
      if (draft !== lastSaved.current) {
        lastSaved.current = draft;
        setDirty(false);
        saveNotes(draft);
      }
    }, 1500);
    return () => clearTimeout(t);
  }, [draft, dirty, saveNotes]);

  function saveNow() {
    lastSaved.current = draft;
    setDirty(false);
    saveNotes(draft);
  }

  const status = notesSaving
    ? "Saving…"
    : dirty
      ? "Unsaved — autosaves shortly"
      : "Saved";

  return (
    <section>
      <SectionHeader
        title="Strategy & Notes"
        description="Your thesis and ideas, in your own words — folded into the context every AI agent reads, so you never have to re-explain yourself."
      />

      <Card className="p-3 flex items-start gap-2.5 mb-3 bg-emerald-50/50 border-emerald-100">
        {InfoIcon}
        <p className="text-xs text-gray-500 leading-relaxed">
          This is served alongside your portfolio over MCP and copy-paste, and it&apos;s woven into
          your AI-generated investor profile on the next sync. Keep it high-signal: thesis, rules,
          watchlist reasoning, ideas to try.
        </p>
      </Card>

      <Textarea
        value={draft}
        onChange={(e) => {
          setDraft(e.target.value);
          setDirty(true);
        }}
        rows={16}
        placeholder={PLACEHOLDER}
        maxLength={MAX}
        aria-label="Strategy notes"
      />

      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs text-gray-400">
          {status} · {draft.length.toLocaleString()}/{MAX.toLocaleString()}
        </span>
        <Button size="sm" onClick={saveNow} loading={notesSaving} disabled={!dirty && !notesSaving}>
          Save
        </Button>
      </div>
    </section>
  );
}
