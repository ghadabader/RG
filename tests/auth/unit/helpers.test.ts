// Unit tests for the pure helpers behind ACCEPT 2, 6 and 7.
import { describe, expect, it } from "vitest";
import { safeNext } from "@/lib/auth/safeNext";
import { validateCredentials, validateEmail, validatePassword } from "@/lib/auth/validate";
import { resolveLocale } from "@/lib/i18n/resolveLocale";
import { LOCALES, isLocale, isRtl } from "@/lib/i18n/locales";

describe("safeNext (ACCEPT 7)", () => {
  it.each(["/", "/history", "/results/abc?tab=1", "/a/b#c"])("keeps relative path %s", (v) => {
    expect(safeNext(v)).toBe(v);
  });

  it.each([
    "//evil.example",
    "https://evil.example",
    "/\\evil.example",
    "\\\\evil.example",
    "/\t/evil.example",
    "javascript:alert(1)",
    "evil.example",
    "",
    null,
    undefined,
  ])("rejects %j", (v) => {
    expect(safeNext(v as string | null | undefined)).toBe("/");
  });
});

describe("validate (ACCEPT 2: only email + password, 8+ chars, no composition rules)", () => {
  it("accepts a well-formed email", () => {
    expect(validateEmail("a.b+c@example.com")).toBe(true);
  });

  it.each(["", "no-at-sign", "a@b", "a @b.com", "@b.com"])("rejects email %j", (v) => {
    expect(validateEmail(v)).toBe(false);
  });

  it("requires at least 8 characters and nothing else", () => {
    expect(validatePassword("1234567")).toBe(false);
    expect(validatePassword("aaaaaaaa")).toBe(true);
  });

  it("returns field-level errors", () => {
    expect(validateCredentials("bad", "short")).toEqual({
      email: "invalid_email",
      password: "password_too_short",
    });
    expect(validateCredentials("a@b.co", "longenough")).toEqual({});
  });
});

describe("resolveLocale (Spec 0006 INTERFACE, used by sign-up for ACCEPT 6)", () => {
  it("knows exactly en, ar, he", () => {
    expect([...LOCALES]).toEqual(["en", "ar", "he"]);
    expect(isLocale("he")).toBe(true);
    expect(isLocale("fr")).toBe(false);
    expect(isRtl("ar")).toBe(true);
    expect(isRtl("he")).toBe(true);
    expect(isRtl("en")).toBe(false);
  });

  it("prefers a valid cookie", () => {
    expect(resolveLocale("he", "ar,en;q=0.5")).toBe("he");
  });

  it("ignores an invalid cookie and falls back to Accept-Language", () => {
    expect(resolveLocale("fr", "he-IL,he;q=0.9,en;q=0.8")).toBe("he");
  });

  it("honours q-values", () => {
    expect(resolveLocale(undefined, "en;q=0.3, ar;q=0.9")).toBe("ar");
  });

  it("falls back to en", () => {
    expect(resolveLocale(undefined, "fr-FR,de;q=0.9")).toBe("en");
    expect(resolveLocale(undefined, null)).toBe("en");
  });
});
