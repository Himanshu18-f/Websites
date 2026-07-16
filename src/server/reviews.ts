import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Review, InsertReview } from "~/lib/database.types";

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || "";

function getClient() {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export const getApprovedReviews = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = getClient();
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("approved", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getApprovedReviews error:", error.message);
    return [] as Review[];
  }

  return (data || []) as Review[];
});

export const getPinnedReviews = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = getClient();
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("approved", true)
    .eq("pinned", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getPinnedReviews error:", error.message);
    return [] as Review[];
  }

  return (data || []) as Review[];
});

export const submitReview = createServerFn({ method: "POST" })
  .validator((data: InsertReview) => {
    if (data.rating < 1 || data.rating > 5) {
      throw new Error("Rating must be between 1 and 5");
    }
    if (!data.content || data.content.trim().length === 0) {
      throw new Error("Review content is required");
    }
    return data;
  })
  .handler(async ({ data }) => {
    const supabase = getClient();
    const { error } = await supabase.from("reviews").insert({
      author_name: data.author_name || null,
      rating: data.rating,
      content: data.content,
      approved: false,
      pinned: false,
    });

    if (error) {
      console.error("submitReview error:", error.message);
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  });