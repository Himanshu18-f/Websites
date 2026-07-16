import { createServerFn } from "@tanstack/react-start";

export interface Project {
  id: string;
  title: string;
  slug: string;
  description: string;
  cover_image: string;
  images: string[];
  features: string[];
  tools: string[];
  github_url: string | null;
  live_url: string | null;
  featured: boolean;
  created_at: string;
  updated_at: string;
}

export const getProjects = createServerFn({ method: "GET" }).handler(async () => {
  // TODO: Implement Supabase query
  return [] as Project[];
});

export const getProject = createServerFn({ method: "GET" })
  .validator((slug: string) => slug)
  .handler(async ({ data: slug }) => {
    // TODO: Implement Supabase query
    return null as Project | null;
  });

export const getFeaturedProjects = createServerFn({ method: "GET" }).handler(async () => {
  // TODO: Implement Supabase query
  return [] as Project[];
});
