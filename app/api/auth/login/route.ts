// POST /api/auth/login — plain form post. Sets the session cookies and, in the same
// response, the locale cookie from the profile (ADR 0010).
import { isAuthRetryableFetchError, type AuthError } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { safeNext } from "@/lib/auth/safeNext";
import { createSupabaseServerClient } from "@/lib/auth/supabaseServer";
import { validateCredentials } from "@/lib/auth/validate";
import { applyProfileLocale } from "@/lib/i18n/applyProfileLocale";

function errorCode(error: AuthError) {
  if (error.status === 429) return "rate_limited";
  if (isAuthRetryableFetchError(error)) return "unavailable";
  // Wrong password and unknown email must look identical (ACCEPT 8).
  return "invalid_credentials";
}

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const email = String(form.get("email") ?? "").trim();
  const password = String(form.get("password") ?? "");
  const next = safeNext(request.nextUrl.searchParams.get("next"));

  const back = (...codes: string[]) => {
    const url = new URL("/login", request.url);
    codes.forEach((code) => url.searchParams.append("error", code));
    if (next !== "/") url.searchParams.set("next", next);
    return NextResponse.redirect(url, 303);
  };

  const fieldErrors = validateCredentials(email, password);
  if (fieldErrors.email) return back(fieldErrors.email);
  // A too-short password can't be anyone's password; treat it like any wrong password.
  if (fieldErrors.password) return back("invalid_credentials");

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) return back(error ? errorCode(error) : "invalid_credentials");

  const response = NextResponse.redirect(new URL(next, request.url), 303);
  await applyProfileLocale(data.user.id, response, supabase);
  return response;
}
