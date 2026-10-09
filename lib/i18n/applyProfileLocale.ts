// Spec 0006 INTERFACE — built early by Spec 0001 (amendment 2).
// Copies profiles.locale into the locale cookie (ADR 0010: login makes the profile's choice
// follow the user across devices). Called by login, by the proxy for logged-in requests
// without a valid cookie, and later by the /settings save (requirement 0007).
import type { SupabaseClient } from "@supabase/supabase-js";
import type { NextResponse } from "next/server";
import { LOCALE_COOKIE, isLocale, type Locale } from "./locales";

export const LOCALE_COOKIE_OPTIONS = {
  path: "/",
  maxAge: 60 * 60 * 24 * 365,
  sameSite: "lax" as const,
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
};

/**
 * Reads the user's saved locale with the given request-bound Supabase client (so row-level
 * security applies) and sets it as the locale cookie on `response`. Returns the locale set,
 * or null when the profile can't be read (the cookie is then left alone).
 */
export async function applyProfileLocale(
  userId: string,
  response: NextResponse,
  supabase: SupabaseClient,
): Promise<Locale | null> {
  const { data } = await supabase.from("profiles").select("locale").eq("user_id", userId).maybeSingle();
  const locale = data?.locale;
  if (!isLocale(locale)) return null;
  response.cookies.set(LOCALE_COOKIE, locale, LOCALE_COOKIE_OPTIONS);
  return locale;
}
