import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || "";

/**
 * Verify a Supabase access token and return the user if valid.
 * Used by admin server functions to authenticate requests.
 */
export async function verifyToken(token: string) {
  const supabase = createClient(
    supabaseUrl,
    process.env.SUPABASE_ANON_KEY || "",
    { auth: { persistSession: false, autoRefreshToken: false } },
  );

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) return null;
  return data.user;
}

/**
 * Get a Supabase client with the service_role key for admin operations.
 * This bypasses RLS - only use in server functions behind auth checks.
 */
export function getServiceClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
  }
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
