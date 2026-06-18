import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Newsreader } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/components/ui";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/** Editorial serif reserved for the thesis/manifesto moments on the landing page. */
const newsreader = Newsreader({
  variable: "--font-editorial",
  subsets: ["latin"],
  style: ["italic"],
  weight: ["400", "500"],
});

const SITE_URL = "https://cryptocontext.earthonline.site";
const TITLE = "CryptoContext — Not your context, not your AI.";
const DESCRIPTION =
  "Your personal crypto context layer. Connect exchanges and wallets once — every AI agent instantly knows what you hold, how you trade, and what your strategy is. MCP-native, open source, free.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: "%s · CryptoContext",
  },
  description: DESCRIPTION,
  keywords: [
    "crypto",
    "portfolio",
    "MCP",
    "Model Context Protocol",
    "AI agent",
    "Claude",
    "ChatGPT",
    "context layer",
    "investor profile",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "CryptoContext",
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#059669",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${newsreader.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-gray-900">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
