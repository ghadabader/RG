// POST /api/auth/reset-password — sets a new password on the recovery session.
import { isAuthRetryableFetchError } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/auth/supabaseServer";
import { validatePassword } from "@/lib/auth/validate";

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const password = String(form.get("password") ?? "");

  const back = (code: string) => {
    const url = new URL("/reset-password", request.url);
    url.searchParams.set("error", code);
    return NextResponse.redirect(url, 303);
  };

  if (!validatePassword(password)) return back("password_too_short");

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    if (error.status === 429) return back("rate_limited");
    if (isAuthRetryableFetchError(error)) return back("unavailable");
    if (error.code === "weak_password") return back("password_too_short");
    if (error.code === "same_password") return back("same_password");
    return back("unavailable");
  }

  return NextResponse.redirect(new URL("/", request.url), 303);
}
