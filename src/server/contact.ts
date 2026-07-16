import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { InsertContactMessage } from "~/lib/database.types";

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || "";

function getClient() {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export const submitContactMessage = createServerFn({ method: "POST" })
  .validator((data: InsertContactMessage) => {
    if (!data.name || data.name.trim().length === 0) {
      throw new Error("Name is required");
    }
    if (!data.email || data.email.trim().length === 0) {
      throw new Error("Email is required");
    }
    if (!data.message || data.message.trim().length === 0) {
      throw new Error("Message is required");
    }
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      throw new Error("Invalid email address");
    }
    return data;
  })
  .handler(async ({ data }) => {
    const supabase = getClient();
    const { error } = await supabase.from("contact_messages").insert({
      name: data.name,
      email: data.email,
      message: data.message,
    });

    if (error) {
      console.error("submitContactMessage error:", error.message);
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  });