import { createServerFn } from "@tanstack/react-start";
import { verifyToken as verifyTokenUtil, getServiceClient } from "~/lib/auth";
import type {
  Project,
  Review,
  ContactMessage,
  InsertProject,
  UpdateProject,
} from "~/lib/database.types";

// ============================================================================
// AUTH
// ============================================================================

export const adminVerifyToken = createServerFn({ method: "POST" })
  .validator((data: { token: string }) => {
    if (!data.token) throw new Error("Token required");
    return data;
  })
  .handler(async ({ data }) => {
    const user = await adminVerifyToken(data.token);
    return { valid: !!user };
  });

export const adminLogin = createServerFn({ method: "POST" })
  .validator(
    (data: { email: string; password: string }) => {
      if (!data.email || !data.password) {
        throw new Error("Email and password are required");
      }
      return data;
    },
  )
  .handler(async ({ data }) => {
    const supabase = getServiceClient();
    const { data: authData, error } =
      await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

    if (error) {
      return { success: false, error: error.message };
    }

    return {
      success: true,
      error: null,
      session: {
        access_token: authData.session.access_token,
        refresh_token: authData.session.refresh_token,
        expires_at: authData.session.expires_at,
      },
    };
  });

// ============================================================================
// PROJECTS (Admin CRUD)
// ============================================================================

export const adminGetProjects = createServerFn({ method: "POST" })
  .validator((data: { token: string }) => {
    if (!data.token) throw new Error("Auth token required");
    return data;
  })
  .handler(async ({ data }) => {
    const user = await adminVerifyToken(data.token);
    if (!user) throw new Error("Unauthorized");

    const supabase = getServiceClient();
    const { data: projects, error } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return (projects || []) as Project[];
  });

export const adminCreateProject = createServerFn({ method: "POST" })
  .validator(
    (data: InsertProject & { token: string }) => {
      if (!data.token) throw new Error("Auth token required");
      if (!data.title) throw new Error("Title is required");
      if (!data.slug) throw new Error("Slug is required");
      return data;
    },
  )
  .handler(async ({ data }) => {
    const user = await adminVerifyToken(data.token);
    if (!user) throw new Error("Unauthorized");

    const supabase = getServiceClient();
    const { data: project, error } = await supabase
      .from("projects")
      .insert({
        title: data.title,
        slug: data.slug,
        description: data.description,
        cover_image: data.cover_image,
        images: data.images || [],
        features: data.features || [],
        tools: data.tools || [],
        github_url: data.github_url,
        live_url: data.live_url,
        featured: data.featured || false,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return project as Project;
  });

export const adminUpdateProject = createServerFn({ method: "POST" })
  .validator(
    (data: { id: string; updates: UpdateProject; token: string }) => {
      if (!data.token) throw new Error("Auth token required");
      if (!data.id) throw new Error("Project ID is required");
      return data;
    },
  )
  .handler(async ({ data }) => {
    const user = await adminVerifyToken(data.token);
    if (!user) throw new Error("Unauthorized");

    const supabase = getServiceClient();
    const { data: project, error } = await supabase
      .from("projects")
      .update(data.updates)
      .eq("id", data.id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return project as Project;
  });

export const adminDeleteProject = createServerFn({ method: "POST" })
  .validator((data: { id: string; token: string }) => {
    if (!data.token) throw new Error("Auth token required");
    if (!data.id) throw new Error("Project ID is required");
    return data;
  })
  .handler(async ({ data }) => {
    const user = await adminVerifyToken(data.token);
    if (!user) throw new Error("Unauthorized");

    const supabase = getServiceClient();
    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", data.id);

    if (error) throw new Error(error.message);
    return { success: true };
  });

// ============================================================================
// REVIEWS (Admin moderation)
// ============================================================================

export const adminGetReviews = createServerFn({ method: "POST" })
  .validator((data: { token: string }) => {
    if (!data.token) throw new Error("Auth token required");
    return data;
  })
  .handler(async ({ data }) => {
    const user = await adminVerifyToken(data.token);
    if (!user) throw new Error("Unauthorized");

    const supabase = getServiceClient();
    const { data: reviews, error } = await supabase
      .from("reviews")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return (reviews || []) as Review[];
  });

export const adminApproveReview = createServerFn({ method: "POST" })
  .validator((data: { id: string; token: string }) => {
    if (!data.token) throw new Error("Auth token required");
    if (!data.id) throw new Error("Review ID is required");
    return data;
  })
  .handler(async ({ data }) => {
    const user = await adminVerifyToken(data.token);
    if (!user) throw new Error("Unauthorized");

    const supabase = getServiceClient();
    const { error } = await supabase
      .from("reviews")
      .update({ approved: true })
      .eq("id", data.id);

    if (error) throw new Error(error.message);
    return { success: true };
  });

export const adminRejectReview = createServerFn({ method: "POST" })
  .validator((data: { id: string; token: string }) => {
    if (!data.token) throw new Error("Auth token required");
    if (!data.id) throw new Error("Review ID is required");
    return data;
  })
  .handler(async ({ data }) => {
    const user = await adminVerifyToken(data.token);
    if (!user) throw new Error("Unauthorized");

    const supabase = getServiceClient();
    const { error } = await supabase
      .from("reviews")
      .update({ approved: false })
      .eq("id", data.id);

    if (error) throw new Error(error.message);
    return { success: true };
  });

export const adminTogglePinReview = createServerFn({ method: "POST" })
  .validator((data: { id: string; pinned: boolean; token: string }) => {
    if (!data.token) throw new Error("Auth token required");
    if (!data.id) throw new Error("Review ID is required");
    return data;
  })
  .handler(async ({ data }) => {
    const user = await adminVerifyToken(data.token);
    if (!user) throw new Error("Unauthorized");

    const supabase = getServiceClient();
    const { error } = await supabase
      .from("reviews")
      .update({ pinned: data.pinned })
      .eq("id", data.id);

    if (error) throw new Error(error.message);
    return { success: true };
  });

export const adminDeleteReview = createServerFn({ method: "POST" })
  .validator((data: { id: string; token: string }) => {
    if (!data.token) throw new Error("Auth token required");
    if (!data.id) throw new Error("Review ID is required");
    return data;
  })
  .handler(async ({ data }) => {
    const user = await adminVerifyToken(data.token);
    if (!user) throw new Error("Unauthorized");

    const supabase = getServiceClient();
    const { error } = await supabase
      .from("reviews")
      .delete()
      .eq("id", data.id);

    if (error) throw new Error(error.message);
    return { success: true };
  });

// ============================================================================
// MESSAGES (Admin)
// ============================================================================

export const adminGetMessages = createServerFn({ method: "POST" })
  .validator((data: { token: string }) => {
    if (!data.token) throw new Error("Auth token required");
    return data;
  })
  .handler(async ({ data }) => {
    const user = await adminVerifyToken(data.token);
    if (!user) throw new Error("Unauthorized");

    const supabase = getServiceClient();
    const { data: messages, error } = await supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return (messages || []) as ContactMessage[];
  });

export const adminToggleReadMessage = createServerFn({ method: "POST" })
  .validator((data: { id: string; read: boolean; token: string }) => {
    if (!data.token) throw new Error("Auth token required");
    if (!data.id) throw new Error("Message ID is required");
    return data;
  })
  .handler(async ({ data }) => {
    const user = await adminVerifyToken(data.token);
    if (!user) throw new Error("Unauthorized");

    const supabase = getServiceClient();
    const { error } = await supabase
      .from("contact_messages")
      .update({ read: data.read })
      .eq("id", data.id);

    if (error) throw new Error(error.message);
    return { success: true };
  });

export const adminDeleteMessage = createServerFn({ method: "POST" })
  .validator((data: { id: string; token: string }) => {
    if (!data.token) throw new Error("Auth token required");
    if (!data.id) throw new Error("Message ID is required");
    return data;
  })
  .handler(async ({ data }) => {
    const user = await adminVerifyToken(data.token);
    if (!user) throw new Error("Unauthorized");

    const supabase = getServiceClient();
    const { error } = await supabase
      .from("contact_messages")
      .delete()
      .eq("id", data.id);

    if (error) throw new Error(error.message);
    return { success: true };
  });

// ============================================================================
// ADMIN DASHBOARD STATS
// ============================================================================

export const adminGetStats = createServerFn({ method: "POST" })
  .validator((data: { token: string }) => {
    if (!data.token) throw new Error("Auth token required");
    return data;
  })
  .handler(async ({ data }) => {
    const user = await adminVerifyToken(data.token);
    if (!user) throw new Error("Unauthorized");

    const supabase = getServiceClient();

    const [
      { count: totalProjects },
      { count: pendingReviews },
      { count: unreadMessages },
    ] = await Promise.all([
      supabase
        .from("projects")
        .select("*", { count: "exact", head: true }),
      supabase
        .from("reviews")
        .select("*", { count: "exact", head: true })
        .eq("approved", false),
      supabase
        .from("contact_messages")
        .select("*", { count: "exact", head: true })
        .eq("read", false),
    ]);

    return {
      totalProjects: totalProjects || 0,
      pendingReviews: pendingReviews || 0,
      unreadMessages: unreadMessages || 0,
    };
  });

// ============================================================================
// SETTINGS
// ============================================================================

export interface SiteSettings {
  hero_heading: string;
  hero_subheading: string;
  about_content: string;
  resume_url: string | null;
  github_url: string;
  linkedin_url: string;
  instagram_url: string;
  threads_url: string;
  email: string;
}

const defaultSettings: SiteSettings = {
  hero_heading: "Himanshu Jaiswal",
  hero_subheading:
    "AI-Assisted Digital Creator — building modern websites, AI-powered solutions, and digital experiences.",
  about_content: "",
  resume_url: null,
  github_url: "https://github.com/Himanshu18-f",
  linkedin_url: "https://linkedin.com/in/himanshujaiswal",
  instagram_url: "https://instagram.com/himanshu.jaiswal",
  threads_url: "https://threads.net/@himanshu.jaiswal",
  email: "himanshu@digitalstudio.dev",
};

export const adminGetSettings = createServerFn({ method: "POST" })
  .validator((data: { token: string }) => {
    if (!data.token) throw new Error("Auth token required");
    return data;
  })
  .handler(async ({ data }) => {
    const user = await adminVerifyToken(data.token);
    if (!user) throw new Error("Unauthorized");

    const supabase = getServiceClient();
    const { data: row, error } = await supabase
      .from("site_settings")
      .select("settings")
      .eq("id", "main")
      .single();

    if (error || !row) {
      return defaultSettings;
    }

    return { ...defaultSettings, ...(row.settings as Partial<SiteSettings>) };
  });

export const adminUpdateSettings = createServerFn({ method: "POST" })
  .validator(
    (data: SiteSettings & { token: string }) => {
      if (!data.token) throw new Error("Auth token required");
      return data;
    },
  )
  .handler(async ({ data }) => {
    const user = await adminVerifyToken(data.token);
    if (!user) throw new Error("Unauthorized");

    const supabase = getServiceClient();
    const { token, ...settings } = data;

    const { error } = await supabase.from("site_settings").upsert(
      {
        id: "main",
        settings,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" },
    );

    if (error) throw new Error(error.message);
    return { success: true };
  });

// ============================================================================
// CLOUDINARY UPLOAD
// ============================================================================

export const adminCloudinaryUpload = createServerFn({ method: "POST" })
  .validator(
    (data: { file: string; folder?: string; token: string }) => {
      if (!data.token) throw new Error("Auth token required");
      if (!data.file) throw new Error("File data is required");
      return data;
    },
  )
  .handler(async ({ data }) => {
    const user = await adminVerifyToken(data.token);
    if (!user) throw new Error("Unauthorized");

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      throw new Error("Cloudinary is not configured");
    }

    const formData = new FormData();
    formData.append("file", data.file);
    formData.append("upload_preset", "portfolio_uploads");
    if (data.folder) {
      formData.append("folder", data.folder);
    }

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: "POST", body: formData },
    );

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Cloudinary upload failed: ${err}`);
    }

    const result = await response.json();
    return {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
    };
  });

// ============================================================================
// RESUME UPLOAD (Cloudinary PDF)
// ============================================================================

export const adminResumeUpload = createServerFn({ method: "POST" })
  .validator(
    (data: { file: string; token: string }) => {
      if (!data.token) throw new Error("Auth token required");
      if (!data.file) throw new Error("File data is required");
      return data;
    },
  )
  .handler(async ({ data }) => {
    const user = await adminVerifyToken(data.token);
    if (!user) throw new Error("Unauthorized");

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      throw new Error("Cloudinary is not configured");
    }

    const formData = new FormData();
    formData.append("file", data.file);
    formData.append("upload_preset", "portfolio_uploads");
    formData.append("folder", "resume");
    formData.append("resource_type", "raw");

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`,
      { method: "POST", body: formData },
    );

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Cloudinary upload failed: ${err}`);
    }

    const result = await response.json();
    return { url: result.secure_url, publicId: result.public_id };
  });
