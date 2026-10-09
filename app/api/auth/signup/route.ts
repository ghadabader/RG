// POST /api/auth/signup — plain form post. Confirmation is off, so sign-up returns a session.
import { isAuthRetryableFetchError, type AuthError } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { safeNext } from "@/lib/auth/safeNext";
import { createSupabaseServerClient } from "@/lib/auth/supabaseServer";
import { validateCredentials } from "@/lib/auth/validate";
import { LOCALE_COOKIE } from "@/lib/i18n/locales";
import { resolveLocale } from "@/lib/i18n/resolveLocale";

function errorCode(error: AuthError) {
  if (error.code === "user_already_exists" || error.code === "email_exists") return "email_taken";
  if (error.status === 429) return "rate_limited";
  if (isAuthRetryableFetchError(error)) return "unavailable";
  if (error.code === "weak_password") return "password_too_short";
  if (error.code === "email_address_invalid" || error.code === "validation_failed") return "invalid_email";
  return "unavailable";
}

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const email = String(form.get("email") ?? "").trim();
  const password = String(form.get("password") ?? "");
  const next = safeNext(request.nextUrl.searchParams.get("next"));

  const back = (...codes: string[]) => {
    const url = new URL("/signup", request.url);
    codes.forEach((code) => url.searchParams.append("error", code));
    if (next !== "/") url.searchParams.set("next", next);
    return NextResponse.redirect(url, 303);
  };

  const fieldErrors = validateCredentials(email, password);
  if (fieldErrors.email || fieldErrors.password) {
    return back(...Object.values(fieldErrors));
  }

  const locale = resolveLocale(
    request.cookies.get(LOCALE_COOKIE)?.value,
    request.headers.get("accept-language"),
  );
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { locale } } });
  if (error) return back(errorCode(error));
  // An existing confirmed email can come back as a user without a session or identities.
  if (!data.session) return back(data.user?.identities?.length === 0 ? "email_taken" : "unavailable");

  return NextResponse.redirect(new URL(next, request.url), 303);
}
