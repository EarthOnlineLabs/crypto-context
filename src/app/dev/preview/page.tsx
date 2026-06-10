import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DemoShell } from "@/components/demo/DemoShell";

export const metadata: Metadata = {
  title: "Dashboard preview (dev)",
  robots: { index: false, follow: false },
};

/**
 * Dev-only visual harness for the dashboard: the shared demo shell plus a
 * scenario switcher (populated / first-run). Returns 404 in production —
 * the public equivalent is /demo.
 */
export default function DevPreviewPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return <DemoShell mode="dev" />;
}
