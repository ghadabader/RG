// End-to-end tests for Spec 0001 ACCEPT lines 1–4 and 6–10 (5 is in tests/auth/unit/rls.test.ts).
// Runs against `next dev` and the shared dev Supabase project.
import { expect, test, type APIRequestContext, type BrowserContext } from "@playwright/test";
import { readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import {
  TEST_PASSWORD,
  adminClient,
  createTestUser,
  deleteTestUser,
  profileOf,
  testEmail,
  userIdByEmail,
} from "../support";

const BASE = "http://localhost:3000";
const created: string[] = [];

test.afterAll(async () => {
  for (const id of created) await deleteTestUser(id);
});

async function seededUser(locale?: string) {
  const user = await createTestUser(locale);
  created.push(user.id);
  return user;
}

async function setLocaleCookie(context: BrowserContext, value: string) {
  await context.addCookies([{ name: "locale", value, url: BASE }]);
}

async function hasSession(context: BrowserContext) {
  return (await context.cookies(BASE)).some((c) => /^sb-.*-auth-token/.test(c.name));
}

function postForm(request: APIRequestContext, path: string, form: Record<string, string>) {
  return request.post(path, { form, maxRedirects: 0 });
}

function setCookieHeaders(res: { headersArray(): { name: string; value: string }[] }) {
  return res
    .headersArray()
    .filter((h) => h.name.toLowerCase() === "set-cookie")
    .map((h) => h.value);
}

async function signUpThroughForm(context: BrowserContext, email: string) {
  const page = await context.newPage();
  await page.goto("/");
  await page.goto("/signup");
  // By field name, not label text: the page may render in Arabic or Hebrew.
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="password"]').fill(TEST_PASSWORD);
  await page.locator('button[type="submit"]').click();
  await page.waitForURL(`${BASE}/`);
  return page;
}

test.describe.configure({ mode: "serial" });

test("ACCEPT 1: from / through sign-up to a logged-in / in under 60 seconds", async ({ browser }) => {
  const context = await browser.newContext();
  await setLocaleCookie(context, "en"); // first-visit language choice is made before the timer
  const email = testEmail();
  const started = Date.now();
  await signUpThroughForm(context, email);
  const elapsed = Date.now() - started;
  expect(await hasSession(context)).toBe(true);
  expect(elapsed).toBeLessThan(60_000);
  const id = await userIdByEmail(email);
  if (id) created.push(id);
  await context.close();
});

test("ACCEPT 2: sign-up has exactly email + password and writes only auth.users + profiles", async ({ browser }) => {
  const context = await browser.newContext();
  await setLocaleCookie(context, "en");
  const page = await context.newPage();
  await page.goto("/signup?next=/history");
  const inputs = page.locator("form input");
  await expect(inputs).toHaveCount(2);
  expect(await inputs.evaluateAll((els) => els.map((e) => (e as HTMLInputElement).type).sort())).toEqual([
    "email",
    "password",
  ]);

  const email = testEmail();
  await signUpThroughForm(context, email);
  const id = await userIdByEmail(email);
  expect(id).toBeTruthy();
  created.push(id!);

  const profile = await profileOf(id!);
  expect(Object.keys(profile!).sort()).toEqual(["created_at", "locale", "updated_at", "user_id"]);

  const { data } = await adminClient().auth.admin.getUserById(id!);
  const user = data.user!;
  expect(user.phone ?? "").toBe("");
  const extraMetadata = Object.keys(user.user_metadata).filter(
    (k) => !["locale", "email", "email_verified", "phone_verified", "sub"].includes(k),
  );
  expect(extraMetadata).toEqual([]);
  await context.close();
});

test("ACCEPT 3: log in, log out, /history redirects to /login?next=/history, and login returns there", async ({ browser }) => {
  const user = await seededUser();
  const context = await browser.newContext();
  await setLocaleCookie(context, "en");
  const page = await context.newPage();

  await page.goto("/login");
  await page.getByLabel(/email/i).fill(user.email);
  await page.getByLabel(/^password$/i).fill(user.password);
  await page.getByRole("button", { name: /log in/i }).click();
  await page.waitForURL(`${BASE}/`);
  expect(await hasSession(context)).toBe(true);

  const logout = await page.request.post("/api/auth/logout", { maxRedirects: 0 });
  expect([302, 303, 307]).toContain(logout.status());
  expect(await hasSession(context)).toBe(false);

  await page.goto("/history");
  expect(new URL(page.url()).pathname).toBe("/login");
  expect(new URL(page.url()).searchParams.get("next")).toBe("/history");

  await page.getByLabel(/email/i).fill(user.email);
  await page.getByLabel(/^password$/i).fill(user.password);
  await page.getByRole("button", { name: /log in/i }).click();
  await page.waitForURL(`${BASE}/history`);
  await context.close();
});

// The full route list in the repo, derived from app/**/page.tsx and app/**/route.ts.
function appRoutes() {
  const out: { path: string; kind: "page" | "route" }[] = [];
  const walk = (dir: string) => {
    for (const name of readdirSync(dir)) {
      const full = join(dir, name);
      if (statSync(full).isDirectory()) walk(full);
      else if (name === "page.tsx" || name === "route.ts") {
        const segs = relative("app", dir).split(sep).filter(Boolean)
          .filter((s) => !/^\(.*\)$/.test(s))
          .map((s) => (s.startsWith("[") ? "test-id" : s));
        out.push({ path: "/" + segs.join("/"), kind: name === "page.tsx" ? "page" : "route" });
      }
    }
  };
  walk("app");
  return out;
}

const PUBLIC_PAGES = ["/", "/login", "/signup", "/forgot-password", "/auth/confirm"];
const PUBLIC_POSTS = ["/api/auth/signup", "/api/auth/login", "/api/auth/forgot-password", "/api/locale"];

test("ACCEPT 4: with no session, every non-public page redirects to /login and every non-public API returns 401", async ({ request }) => {
  const routes = appRoutes();
  expect(routes.length).toBeGreaterThan(5);
  for (const { path, kind } of routes) {
    if (path.startsWith("/api/")) {
      for (const method of ["GET", "POST"] as const) {
        if (method === "POST" && PUBLIC_POSTS.includes(path)) continue;
        const res = await request.fetch(path, { method, maxRedirects: 0 });
        expect(res.status(), `${method} ${path}`).toBe(401);
        expect(await res.json(), `${method} ${path}`).toHaveProperty("error");
      }
    } else if (!PUBLIC_PAGES.includes(path)) {
      const res = await request.get(path, { maxRedirects: 0 });
      expect([302, 303, 307], `${kind} ${path}`).toContain(res.status());
      const location = new URL(res.headers()["location"], BASE);
      expect(location.pathname, path).toBe("/login");
      expect(location.searchParams.get("next"), path).toBe(path);
    }
  }
  // A path with no page yet is protected by default too.
  const res = await request.get("/settings", { maxRedirects: 0 });
  expect(new URL(res.headers()["location"], BASE).pathname).toBe("/login");
});

test("ACCEPT 6: sign-up with locale=he stores he; login from a fresh browser sets locale=he", async ({ browser, playwright }) => {
  const context = await browser.newContext();
  await setLocaleCookie(context, "he");
  const email = testEmail();
  await signUpThroughForm(context, email);
  const id = await userIdByEmail(email);
  created.push(id!);
  expect((await profileOf(id!))?.locale).toBe("he");
  await context.close();

  const fresh = await playwright.request.newContext({ baseURL: BASE });
  const res = await postForm(fresh, "/api/auth/login", { email, password: TEST_PASSWORD });
  expect([302, 303]).toContain(res.status());
  expect(setCookieHeaders(res).some((c) => /^locale=he(;|$)/.test(c))).toBe(true);
  await fresh.dispose();
});

test("ACCEPT 7: login with an off-site next always redirects to /", async ({ playwright }) => {
  const user = await seededUser();
  for (const next of ["//evil.example", "https://evil.example", "/\\evil.example"]) {
    const ctx = await playwright.request.newContext({ baseURL: BASE });
    const res = await ctx.post(`/api/auth/login?next=${encodeURIComponent(next)}`, {
      form: { email: user.email, password: user.password },
      maxRedirects: 0,
    });
    expect([302, 303], next).toContain(res.status());
    expect(new URL(res.headers()["location"], BASE).href, next).toBe(`${BASE}/`);
    await ctx.dispose();
  }
});

test("ACCEPT 8: wrong password and unknown email give the same status and body", async ({ playwright }) => {
  const user = await seededUser();
  const a = await playwright.request.newContext({ baseURL: BASE });
  const b = await playwright.request.newContext({ baseURL: BASE });
  const wrongPassword = await postForm(a, "/api/auth/login", { email: user.email, password: "not-the-password" });
  const unknownEmail = await postForm(b, "/api/auth/login", { email: testEmail(), password: "not-the-password" });
  expect(wrongPassword.status()).toBe(unknownEmail.status());
  expect(wrongPassword.headers()["location"]).toBe(unknownEmail.headers()["location"]);
  expect(await wrongPassword.text()).toBe(await unknownEmail.text());
  expect(setCookieHeaders(wrongPassword).some((c) => /auth-token/.test(c))).toBe(false);
  await a.dispose();
  await b.dispose();
});

test("ACCEPT 9: a reset link sets a new password once; a reused link lands on /forgot-password with the expiry message", async ({ browser, playwright }) => {
  const user = await seededUser();
  const { data, error } = await adminClient().auth.admin.generateLink({ type: "recovery", email: user.email });
  expect(error).toBeNull();
  const link = `/auth/confirm?token_hash=${data.properties!.hashed_token}&type=recovery`;
  const newPassword = "brand-new-password-9";

  const context = await browser.newContext();
  await setLocaleCookie(context, "en");
  const page = await context.newPage();
  await page.goto(link);
  await page.waitForURL(`${BASE}/reset-password`);
  await page.getByLabel(/new password/i).fill(newPassword);
  await page.getByRole("button", { name: /set|save|reset/i }).click();
  await page.waitForURL(`${BASE}/`);
  await context.close();

  const api = await playwright.request.newContext({ baseURL: BASE });
  const oldLogin = await postForm(api, "/api/auth/login", { email: user.email, password: user.password });
  expect(new URL(oldLogin.headers()["location"], BASE).pathname).toBe("/login");
  const newLogin = await postForm(api, "/api/auth/login", { email: user.email, password: newPassword });
  expect(new URL(newLogin.headers()["location"], BASE).pathname).toBe("/");
  await api.dispose();

  const second = await browser.newContext();
  await setLocaleCookie(second, "en");
  const again = await second.newPage();
  await again.goto(link);
  expect(new URL(again.url()).pathname).toBe("/forgot-password");
  expect(new URL(again.url()).searchParams.get("error")).toBe("expired");
  await expect(again.getByText(/this link has expired/i)).toBeVisible();
  await second.close();
});

test("ACCEPT 10: a logged-in request without a locale cookie gets one from profiles.locale", async ({ playwright }) => {
  const user = await seededUser("ar");
  const ctx = await playwright.request.newContext({ baseURL: BASE });
  const login = await postForm(ctx, "/api/auth/login", { email: user.email, password: user.password });
  expect([302, 303]).toContain(login.status());

  // Drop only the locale cookie, keep the session.
  const state = await ctx.storageState();
  const withoutLocale = await playwright.request.newContext({
    baseURL: BASE,
    storageState: { ...state, cookies: state.cookies.filter((c) => c.name !== "locale") },
  });
  const res = await withoutLocale.get("/", { maxRedirects: 0 });
  expect(setCookieHeaders(res).some((c) => /^locale=ar(;|$)/.test(c))).toBe(true);
  await ctx.dispose();
  await withoutLocale.dispose();
});
