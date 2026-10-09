// POST /api/auth/forgot-password — always answers with the same neutral message,
// whether or not an account exists for the email.
import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/auth/supabaseServer";
import { validateEmail } from "@/lib/auth/validate";

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const email = String(form.get("email") ?? "").trim();
  const url = new URL("/forgot-password", request.url);

  if (!validateEmail(email)) {
    url.searchParams.set("error", "invalid_email");
    return NextResponse.redirect(url, 303);
  }

  const siteUrl = process.env.SITE_URL ?? new URL(request.url).origin;
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/auth/confirm`,
  });

  // Rate limiting says nothing about whether the email exists, so it may be shown.
  if (error?.status === 429) url.searchParams.set("error", "rate_limited");
  else url.searchParams.set("sent", "1");
  return NextResponse.redirect(url, 303);
}
