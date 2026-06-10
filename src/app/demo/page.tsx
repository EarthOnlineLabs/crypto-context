import type { Metadata } from "next";
import { DemoShell } from "@/components/demo/DemoShell";

export const metadata: Metadata = {
  title: "Live demo",
  description:
    "Click around the CryptoContext dashboard with fabricated data — portfolio, AI investor profile, strategy notes, and the MCP connection — no signup needed.",
  alternates: { canonical: "/demo" },
};

/**
 * Public, no-signup interactive demo. The entire dashboard runs against
 * fabricated fixtures (provider mock mode — no real API paths are reachable).
 */
export default function DemoPage() {
  return <DemoShell mode="demo" />;
}
