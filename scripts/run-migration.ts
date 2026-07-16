#!/usr/bin/env bun
/**
 * Run the Supabase migration SQL file using the service role key.
 * Usage: bun run scripts/run-migration.ts
 *
 * This script reads the migration SQL file and executes it via
 * the Supabase client with the service_role key for admin operations.
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "..");

async function runMigration() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error(
      "❌ SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in the environment.",
    );
    console.error(
      "   These are injected automatically when the Supabase service is connected.",
    );
    process.exit(1);
  }

  const migrationPath = resolve(
    projectRoot,
    "supabase/migrations/001_initial_schema.sql",
  );
  const sql = readFileSync(migrationPath, "utf-8");

  console.log("📦 Running migration: 001_initial_schema.sql");
  console.log(`   URL: ${supabaseUrl.substring(0, 30)}...\n`);

  // Create a Supabase client with the service_role key for admin operations
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  // Execute the SQL via Supabase's REST API using rpc()
  // Since there's no direct SQL execution in supabase-js, we use
  // the management API by posting to the /rest/v1/rpc/ endpoint
  // with a custom function, or we use the raw SQL endpoint.
  //
  // We'll split the SQL into individual statements and try executing
  // via the REST API's raw query capability.
  try {
    const { data, error } = await supabase.rpc("exec_sql", {
      sql_query: sql,
    });

    if (error) {
      // If exec_sql function doesn't exist, try alternative approach
      // using the pg_dump-style REST endpoint
      console.log(
        "⚠️  exec_sql RPC not available, trying direct SQL endpoint...\n",
      );
      return await runViaRestApi(supabaseUrl, serviceRoleKey, sql);
    }

    console.log("✅ Migration completed successfully via RPC.");
    console.log("   Result:", data);
    return;
  } catch (err) {
    // Fall through to REST API approach
    console.log(
      "⚠️  RPC approach failed, trying direct REST API...\n",
      (err as Error).message,
    );
    return await runViaRestApi(supabaseUrl, serviceRoleKey, sql);
  }
}

async function runViaRestApi(
  supabaseUrl: string,
  serviceRoleKey: string,
  sql: string,
) {
  // Split by semicolons but keep DO blocks intact
  // A simpler approach: execute the whole SQL via the Supabase REST SQL endpoint
  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
    },
    body: JSON.stringify({
      sql_query: sql,
    }),
  });

  if (response.ok || response.status === 404) {
    // 404 means the exec_sql function doesn't exist yet — we need to create it first
    console.log(
      "ℹ️  Creating exec_sql helper function and retrying...",
    );
    return await createAndRun(sql, supabaseUrl, serviceRoleKey);
  }

  const text = await response.text();
  throw new Error(`REST API error (${response.status}): ${text}`);
}

async function createAndRun(
  sql: string,
  supabaseUrl: string,
  serviceRoleKey: string,
) {
  // Create the helper function first, then run the migration
  const createFnSql = `
CREATE OR REPLACE FUNCTION exec_sql(sql_query text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql_query;
END;
$$;
`;

  // We need to use the raw PostgREST endpoint. Since supabase-js doesn't
  // support raw SQL execution directly through the client, and the
  // exec_sql function might not exist, let's try a different approach:
  // use the supabase-js client's query method with a workaround.
  //
  // Actually, the simplest approach is to use the supabase service role client
  // with a direct connection. But since we're using supabase-js (not direct pg),
  // we need the exec_sql function already available.
  //
  // Alternative: use the database's REST endpoint with raw SQL capabilities.
  // Most Supabase projects have the pg_graphql extension or we can use
  // the pg_dump endpoint.

  console.log("\n📝 Attempting to create exec_sql function and run migration...");

  try {
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // Try running the SQL directly through a raw query
    // Bun + supabase-js doesn't support raw SQL out of the box.
    // But we can use the /rest/v1/ endpoint directly.
    //
    // Actually, let's try a simpler approach: use the management API.

    console.log(
      "ℹ️  To run this migration, you can execute the SQL directly in the Supabase SQL editor.",
    );
    console.log("   Migration file location: supabase/migrations/001_initial_schema.sql");
    console.log(
      "\n   Or run: cat supabase/migrations/001_initial_schema.sql | curl -X POST $SUPABASE_URL/rest/v1/rpc/exec_sql",
    );
    console.log(
      "   after ensuring the exec_sql function exists in your Supabase project.\n",
    );
    console.error("❌ Cannot run migration: no SQL execution endpoint available.");
    console.error(
      "   Create the exec_sql function manually in the Supabase SQL editor:",
    );
    console.error(createFnSql);
    console.error("\n   Then re-run this script to apply the migration.");
    process.exit(1);
  } catch (err) {
    console.error("❌ Failed to run migration:", (err as Error).message);
    process.exit(1);
  }
}

runMigration().catch((err) => {
  console.error("❌ Migration failed:", err.message);
  process.exit(1);
});