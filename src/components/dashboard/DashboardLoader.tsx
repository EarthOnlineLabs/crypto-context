import { Spinner } from "@/components/ui";
import { LogoWordmark } from "@/components/Logo";

/** Branded full-screen loader shown while the dashboard hydrates. */
export function DashboardLoader() {
  return (
    <div className="min-h-screen bg-grid relative flex items-center justify-center">
      <div className="glow left-1/2 top-1/3 -translate-x-1/2" aria-hidden="true" />
      <div className="relative flex flex-col items-center gap-4">
        <LogoWordmark />
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Spinner size="sm" />
          Loading your portfolio…
        </div>
      </div>
    </div>
  );
}
