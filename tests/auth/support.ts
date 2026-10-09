// Shared helpers for the Spec 0001 tests.
// The service-role key is used here, in test code only (user decision 2026-10-09, KAN-1).
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";
import { existsSync } from "node:fs";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is missing from .env.local`);
  return value;
}

export const SUPABASE_URL = required("NEXT_PUBLIC_SUPABASE_URL");
export const SUPABASE_ANON_KEY = required("NEXT_PUBLIC_SUPABASE_ANON_KEY");

export function adminClient(): SupabaseClient {
  return createClient(SUPABASE_URL, required("SUPABASE_SERVICE_ROLE_KEY"), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function anonClient(): SupabaseClient {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function testEmail(): string {
  return `rg-test-${randomUUID().slice(0, 12)}@example.com`;
}

export const TEST_PASSWORD = "correct-horse-42";

/** Creates a confirmed account directly (no sign-up rate limit), optionally with a locale. */
export async function createTestUser(locale?: string) {
  const email = testEmail();
  const { data, error } = await adminClient().auth.admin.createUser({
    email,
    password: TEST_PASSWORD,
    email_confirm: true,
    user_metadata: locale ? { locale } : {},
  });
  if (error || !data.user) throw error ?? new Error("createUser returned no user");
  return { id: data.user.id, email, password: TEST_PASSWORD };
}

export async function deleteTestUser(id: string | undefined) {
  if (id) await adminClient().auth.admin.deleteUser(id);
}

export async function profileOf(userId: string) {
  const { data, error } = await adminClient()
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return data as Record<string, unknown> | null;
}

export async function userIdByEmail(email: string): Promise<string | undefined> {
  const { data } = await adminClient().auth.admin.listUsers({ perPage: 1000 });
  return data.users.find((u) => u.email === email)?.id;
}
