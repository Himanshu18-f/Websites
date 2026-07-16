export interface Project {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  cover_image: string | null;
  images: string[];
  features: string[];
  tools: string[];
  github_url: string | null;
  live_url: string | null;
  featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  author_name: string | null;
  rating: number;
  content: string;
  approved: boolean;
  pinned: boolean;
  created_at: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  read: boolean;
  created_at: string;
}

export type Tables = {
  projects: Project;
  reviews: Review;
  contact_messages: ContactMessage;
};

export type InsertProject = Omit<Project, "id" | "created_at" | "updated_at">;
export type UpdateProject = Partial<InsertProject>;

export type InsertReview = Omit<
  Review,
  "id" | "approved" | "pinned" | "created_at"
>;
export type InsertContactMessage = Omit<
  ContactMessage,
  "id" | "read" | "created_at"
>;