"use client";

import { useState, type ComponentType } from "react";
import Link from "next/link";
import { DashboardProvider } from "@/components/dashboard/DashboardProvider";
import { AppShell } from "@/components/dashboard/AppShell";
import OverviewPage from "@/app/dashboard/page";
import NotesPage from "@/app/dashboard/notes/page";
import SourcesPage from "@/app/dashboard/sources/page";
import McpPage from "@/app/dashboard/mcp/page";
import { cn } from "@/lib/cn";
import { populatedMock, emptyMock } from "./fixtures";

const VIEWS: Record<string, ComponentType> = {
  "/dashboard": OverviewPage,
  "/dashboard/notes": NotesPage,
  "/dashboard/sources": SourcesPage,
  "/dashboard/mcp": McpPage,
};

type Scenario = "populated" | "empty";

/**
 * The interactive dashboard rendered against fabricated fixtures — zero auth,
 * zero real data. Powers both the public /demo (fixed populated scenario +
 * signup CTA) and the dev-only /dev/preview (scenario switcher).
 */
export function DemoShell({ mode }: { mode: "demo" | "dev" }) {
  const [scenario, setScenario] = useState<Scenario>("populated");
  const [view, setView] = useState("/dashboard");
  const mock = mode === "demo" || scenario === "populated" ? populatedMock : emptyMock;
  const Page = VIEWS[view] ?? OverviewPage;

  return (
    <>
      <DashboardProvider key={mode === "demo" ? "demo" : scenario} mock={mock}>
        <AppShell activePath={view} onNavigate={setView}>
          <Page />
        </AppShell>
      </DashboardProvider>

      {mode === "demo" ? (
        /* Public demo: always-visible fabricated-data notice + conversion CTA. */
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[70] flex items-center gap-2 rounded-full bg-gray-900 text-white pl-4 pr-1.5 py-1.5 shadow-xl shadow-gray-900/25">
          <span className="flex items-center gap-2 text-xs text-gray-300">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" aria-hidden="true" />
            Interactive demo — all data is fabricated
          </span>
          <Link
            href="/signup"
            className="px-3.5 py-1.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-semibold transition"
          >
            Create yours — free
          </Link>
        </div>
      ) : (
        /* Dev-only scenario switcher — not part of the product UI. */
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[70] flex items-center gap-1 rounded-full bg-gray-900 text-white pl-1 pr-1.5 py-1 shadow-xl shadow-gray-900/20">
          <span className="px-2.5 text-xs text-gray-400">Preview</span>
          {(["populated", "empty"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setScenario(s)}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-medium transition",
                scenario === s ? "bg-emerald-500 text-white" : "text-gray-300 hover:text-white"
              )}
            >
              {s === "populated" ? "Populated" : "First-run"}
            </button>
          ))}
        </div>
      )}
    </>
  );
}
