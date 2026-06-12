import type { ReactNode } from "react";
import { LogoWordmark } from "@/components/Logo";

/** Shared auth-page chrome: grid bg, glow, wordmark, glass card, footer link. */
export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-grid relative overflow-hidden">
      <div className="glow top-[-200px] left-1/2 -translate-x-1/2" aria-hidden="true" />

      <div className="relative z-10 w-full max-w-sm">
        <div className="flex items-center justify-center mb-8">
          <LogoWordmark />
        </div>

        <div className="glass rounded-xl p-6 sm:p-8">
          <h1 className="text-xl font-bold text-center text-gray-900">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-gray-400 text-center">{subtitle}</p>}
          {children}
        </div>

        {footer && <div className="mt-6 text-sm text-gray-400 text-center">{footer}</div>}
      </div>
    </div>
  );
}
