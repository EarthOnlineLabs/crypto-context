import { describe, expect, it } from "vitest";
import {
  resolveWalletStyle,
  getWalletBrand,
  getChainBrand,
  getExchangeBrand,
  badgeBg,
  badgeFg,
  WALLET_BRAND_IDS,
} from "../wallets/brands";

describe("resolveWalletStyle", () => {
  it("prefers the chosen wallet brand over the chain", () => {
    expect(resolveWalletStyle("metamask", "ethereum").name).toBe("MetaMask");
  });
  it("falls back to the chain identity when no brand", () => {
    expect(resolveWalletStyle(null, "solana").name).toBe("Solana");
    expect(resolveWalletStyle(undefined, "ethereum").name).toBe("Ethereum");
  });
  it("falls back to chain when the brand id is unknown", () => {
    expect(resolveWalletStyle("not-a-wallet", "arbitrum").name).toBe("Arbitrum");
  });
});

describe("brand registries", () => {
  it("getWalletBrand returns null for unknown/empty ids", () => {
    expect(getWalletBrand("nope")).toBeNull();
    expect(getWalletBrand(null)).toBeNull();
  });
  it("unknown chains get a capitalized fallback with a monogram", () => {
    const b = getChainBrand("linea");
    expect(b.name).toBe("Linea");
    expect(b.monogram).toBe("L");
  });
  it("unknown exchanges stay on-brand (emerald fallback)", () => {
    const b = getExchangeBrand("newexchange");
    expect(b.color.toLowerCase()).toBe("#10b981");
    expect(b.monogram).toBe("N");
  });
  it("WALLET_BRAND_IDS gates server-side validation", () => {
    expect(WALLET_BRAND_IDS.has("metamask")).toBe(true);
    expect(WALLET_BRAND_IDS.has("dogwallet")).toBe(false);
  });
});

describe("badge colours", () => {
  it("badgeBg produces a low-alpha rgba of the brand colour", () => {
    expect(badgeBg("#ff0000")).toBe("rgba(255, 0, 0, 0.14)");
  });
  it("badgeFg darkens the brand colour for legibility", () => {
    expect(badgeFg("#ff0000")).toBe("rgb(199, 0, 0)");
  });
  it("supports 3-digit hex", () => {
    expect(badgeBg("#fff")).toBe("rgba(255, 255, 255, 0.14)");
  });
});
