// Route protection (Spec 0001 "Route protection"; Next.js 16 renamed middleware.ts to proxy.ts).
// Refreshes the Supabase session on every request, sets x-pathname for the root layout,
// restores a logged-in user's locale cookie from their profile, and keeps logged-out
// visitors out of every non-public path. Not the only check: handlers call getCurrentUser()
// and every user-owned table has row-level security.
import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseProxyClient } from "@/lib/auth/supabaseServer";
import { applyProfileLocale } from "@/lib/i18n/applyProfileLocale";
import { LOCALE_COOKIE, isLocale } from "@/lib/i18n/locales";

const PUBLIC_PAGES = new Set(["/", "/login", "/signup", "/forgot-password", "/auth/confirm"]);
const PUBLIC_POSTS = new Set(["/api/auth/signup", "/api/auth/login", "/api/auth/forgot-password", "/api/locale"]);
const LOGGED_OUT_ONLY = new Set(["/login", "/signup"]);

function isPublic(method: string, pathname: string) {
  if (pathname.startsWith("/api/")) return method === "POST" && PUBLIC_POSTS.has(pathname);
  return PUBLIC_PAGES.has(pathname);
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const forward = () => {
    const headers = new Headers(request.headers);
    headers.set("x-pathname", pathname);
    return NextResponse.next({ request: { headers } });
  };

  let response = forward();
  const supabase = createSupabaseProxyClient(request, () => (response = forward()));
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  // Redirects and 401s must carry any refreshed session cookies.
  const withCookies = (target: NextResponse) => {
    response.cookies.getAll().forEach((cookie) => target.cookies.set(cookie));
    return target;
  };

  if (user && LOGGED_OUT_ONLY.has(pathname)) {
    return withCookies(NextResponse.redirect(new URL("/", request.url)));
  }

  if (!user && !isPublic(request.method, pathname)) {
    if (pathname.startsWith("/api/")) {
      return withCookies(NextResponse.json({ error: "unauthorized" }, { status: 401 }));
    }
    const login = new URL("/login", request.url);
    login.searchParams.set("next", pathname + search);
    return withCookies(NextResponse.redirect(login));
  }

  if (user && !isLocale(request.cookies.get(LOCALE_COOKIE)?.value)) {
    const locale = await applyProfileLocale(user.id, response, supabase);
    if (locale) {
      // Let this very request render in the restored language too.
      request.cookies.set(LOCALE_COOKIE, locale);
      const restored = forward();
      response.cookies.getAll().forEach((cookie) => restored.cookies.set(cookie));
      response = restored;
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
