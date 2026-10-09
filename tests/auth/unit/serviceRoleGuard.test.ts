// User decision 2026-10-09 (KAN-1): the service-role key is allowed in test code only.
// The app (app/, lib/, components/, i18n/, proxy.ts) must never reference it.
import { describe, expect, it } from "vitest";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const APP_ROOTS = ["app", "lib", "components", "i18n", "proxy.ts"];

function files(path: string): string[] {
  if (!existsSync(path)) return [];
  if (statSync(path).isFile()) return [path];
  return readdirSync(path).flatMap((name) => files(join(path, name)));
}

describe("service-role key stays out of app code", () => {
  it("app code exists to check", () => {
    expect(files("lib").length).toBeGreaterThan(0);
  });

  it("no app file mentions the service-role key", () => {
    const offenders = APP_ROOTS.flatMap(files)
      .filter((f) => /\.(ts|tsx|js|mjs)$/.test(f))
      .filter((f) => /SERVICE_ROLE|service_role|sb_secret_/.test(readFileSync(f, "utf8")));
    expect(offenders).toEqual([]);
  });
});
