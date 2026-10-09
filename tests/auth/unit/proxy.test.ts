// ACCEPT 10 (second half): every request's layout receives x-pathname equal to the request path.
// ACCEPT 4 (unit level): logged-out API requests get 401 JSON, pages redirect to /login?next=.
import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import "../support";
import { proxy } from "@/proxy";

function req(path: string, method = "GET") {
  return new NextRequest(new URL(path, "http://localhost:3000"), { method });
}

describe("proxy", () => {
  it.each(["/", "/login", "/signup", "/forgot-password"])(
    "passes %s through with x-pathname set (ACCEPT 10)",
    async (path) => {
      const res = await proxy(req(path));
      expect(res.headers.get("x-middleware-request-x-pathname")).toBe(path);
    },
  );

  it("redirects a logged-out page request to /login?next= (ACCEPT 3/4)", async () => {
    const res = await proxy(req("/history?tab=2"));
    expect(res.status).toBeGreaterThanOrEqual(300);
    expect(res.status).toBeLessThan(400);
    const location = new URL(res.headers.get("location")!);
    expect(location.pathname).toBe("/login");
    expect(location.searchParams.get("next")).toBe("/history?tab=2");
  });

  it("answers a logged-out API request with 401 JSON (ACCEPT 4)", async () => {
    const res = await proxy(req("/api/auth/logout", "POST"));
    expect(res.status).toBe(401);
    expect(await res.json()).toHaveProperty("error");
  });

  it("lets the public POST auth routes through without a session", async () => {
    for (const path of ["/api/auth/signup", "/api/auth/login", "/api/auth/forgot-password", "/api/locale"]) {
      const res = await proxy(req(path, "POST"));
      expect(res.status, path).toBe(200);
    }
  });
});
