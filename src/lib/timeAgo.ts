/**
 * Deterministic absolute date, e.g. "May 30, 2026". Pinned to "en-US" so the
 * server and client render identical text — a no-arg toLocaleDateString() uses
 * the runtime's default locale (en-US on the server, the visitor's locale in the
 * browser), which triggers a React hydration mismatch.
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

/** Compact relative time, e.g. "just now", "7m ago", "3h ago", "2d ago". */
export function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 45) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(date);
}
