// GET /auth/confirm — the link in the password-recovery email. A valid token starts a
// recovery session and leads to /reset-password; an invalid, expired or reused one doesn't.
import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/auth/supabaseServer";

export async function GET(request: NextRequest) {
  const tokenHash = request.nextUrl.searchParams.get("token_hash");
  const type = request.nextUrl.searchParams.get("type");

  if (tokenHash && type === "recovery") {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.verifyOtp({ type: "recovery", token_hash: tokenHash });
    if (!error) return NextResponse.redirect(new URL("/reset-password", request.url), 303);
  }

  const expired = new URL("/forgot-password", request.url);
  expired.searchParams.set("error", "expired");
  return NextResponse.redirect(expired, 303);
}
