import { describe, expect, it } from "vitest";
import { validateApiKey, validateSecret, validateUUID, checkRateLimit } from "../security";

describe("validateApiKey", () => {
  it("accepts plain alphanumeric keys", () => {
    expect(validateApiKey("abcDEF123456")).toBeNull();
  });

  it("accepts base64-style keys (Kraken etc.) with + / = .", () => {
    expect(validateApiKey("aBc+dEf/123=")).toBeNull();
    expect(validateApiKey("key.with.dots_and-dashes")).toBeNull();
  });

  it("rejects whitespace and shell metacharacters", () => {
    expect(validateApiKey("abc def")).not.toBeNull();
    expect(validateApiKey("abc;rm -rf")).not.toBeNull();
    expect(validateApiKey("abc<script>")).not.toBeNull();
  });

  it("rejects empty input", () => {
    expect(validateApiKey("")).not.toBeNull();
    expect(validateApiKey("   ")).not.toBeNull();
  });
});

describe("validateSecret", () => {
  it("requires a non-empty secret", () => {
    expect(validateSecret("")).not.toBeNull();
    expect(validateSecret("s3cret+with/base64=")).toBeNull();
  });
});

describe("validateUUID", () => {
  it("accepts a v4-style uuid", () => {
    expect(validateUUID("123e4567-e89b-42d3-a456-426614174000")).toBeNull();
  });
  it("rejects junk", () => {
    expect(validateUUID("not-a-uuid")).not.toBeNull();
    expect(validateUUID("")).not.toBeNull();
  });
});

describe("checkRateLimit", () => {
  it("allows up to the limit then blocks within the window", () => {
    const id = `test-${Math.random()}`;
    for (let i = 0; i < 3; i++) {
      expect(checkRateLimit(id, "unit", 3, 60_000).allowed).toBe(true);
    }
    const blocked = checkRateLimit(id, "unit", 3, 60_000);
    expect(blocked.allowed).toBe(false);
    expect(blocked.resetAt).toBeGreaterThan(Date.now());
  });

  it("scopes limits per endpoint", () => {
    const id = `test-${Math.random()}`;
    expect(checkRateLimit(id, "ep-a", 1, 60_000).allowed).toBe(true);
    expect(checkRateLimit(id, "ep-a", 1, 60_000).allowed).toBe(false);
    expect(checkRateLimit(id, "ep-b", 1, 60_000).allowed).toBe(true);
  });
});
