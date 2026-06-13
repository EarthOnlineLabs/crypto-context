import { existsSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { BRAND_IMAGE_IDS, TOKEN_IMAGE_SYMBOLS } from "../brand-assets";

/**
 * Guards the hand-maintained real-logo manifest in src/lib/brand-assets.ts
 * against silent drift from the PNGs actually shipped in /public.
 *
 * BrandLogo / TokenIcon render /brands/{id}.png and /tokens/{symbol}.png only
 * when the id/symbol is present in the corresponding Set; otherwise they fall
 * back to a monogram/letter. So a manifest entry with no file — or a file with
 * no entry — is invisible until a logo silently renders as a plain letter,
 * which is exactly the "looks broken / counterfeit" failure these tests catch.
 *
 * Pure filesystem + manifest check; no network.
 */

// app/src/lib/__tests__ -> app/public
const PUBLIC_DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..", "public");

/** Basenames (without the `.png` extension) of every PNG in a /public subdir. */
function pngStems(subdir: string): Set<string> {
  return new Set(
    readdirSync(join(PUBLIC_DIR, subdir))
      .filter((name) => name.endsWith(".png"))
      .map((name) => name.slice(0, -".png".length)),
  );
}

/** Asserts a manifest Set and a /public subdir hold exactly the same ids. */
function assertInSync(manifest: ReadonlySet<string>, subdir: string): void {
  expect(existsSync(join(PUBLIC_DIR, subdir)), `public/${subdir} directory should exist`).toBe(true);

  const files = pngStems(subdir);
  // Manifest entry with no public/<subdir>/{id}.png -> renders as a monogram.
  const missingFile = [...manifest].filter((id) => !files.has(id)).sort();
  // PNG on disk with no manifest entry -> dead weight, never rendered.
  const orphanFile = [...files].filter((id) => !manifest.has(id)).sort();

  expect(missingFile, `manifest entries with no PNG in public/${subdir}`).toEqual([]);
  expect(orphanFile, `PNGs in public/${subdir} with no manifest entry`).toEqual([]);
}

describe("brand-assets manifest ↔ /public", () => {
  it("BRAND_IMAGE_IDS matches public/brands exactly", () => {
    assertInSync(BRAND_IMAGE_IDS, "brands");
  });

  it("TOKEN_IMAGE_SYMBOLS matches public/tokens exactly", () => {
    assertInSync(TOKEN_IMAGE_SYMBOLS, "tokens");
  });

  it("token symbols are lowercase (TokenIcon lowercases lookups)", () => {
    const notLowercase = [...TOKEN_IMAGE_SYMBOLS].filter((s) => s !== s.toLowerCase()).sort();
    expect(notLowercase, "TOKEN_IMAGE_SYMBOLS entries that are not lowercase").toEqual([]);
  });

  it("ships the expected number of real logos", () => {
    // Bump these when you intentionally add or remove a logo + its PNG.
    expect(BRAND_IMAGE_IDS.size).toBe(32);
    expect(TOKEN_IMAGE_SYMBOLS.size).toBe(151);
  });
});
