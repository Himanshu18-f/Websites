import { createServerFn } from "@tanstack/react-start";

export interface Review {
  id: string;
  author_name: string;
  rating: number;
  content: string;
  approved: boolean;
  pinned: boolean;
  created_at: string;
}

export const getApprovedReviews = createServerFn({ method: "GET" }).handler(async () => {
  // TODO: Implement Supabase query
  return [] as Review[];
});

export const getPinnedReviews = createServerFn({ method: "GET" }).handler(async () => {
  // TODO: Implement Supabase query
  return [] as Review[];
});
