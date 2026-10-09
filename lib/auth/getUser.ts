// Every route handler and server component that reads user data must scope it with this.
// auth.getUser() verifies the session with Supabase; never trust getSession() on the server.
import type { User } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "./supabaseServer";

export async function getCurrentUser(): Promise<User | null> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  return data.user ?? null;
}
