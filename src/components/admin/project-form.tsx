import { useState, useRef } from "react";
import { X, Upload, Plus, Trash2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { cn } from "~/lib/utils";
import { adminCloudinaryUpload } from "~/server/admin";
import type { Project } from "~/lib/database.types";

interface ProjectFormProps {
  project?: Project | null;
  token: string;
  onSave: (data: {
    title: string;
    slug: string;
    description: string;
    cover_image: string | null;
    images: string[];
    features: string[];
    tools: string[];
    github_url: string | null;
    live_url: string | null;
    featured: boolean;
  }) => Promise<void>;
  onClose: () => void;
}

export function ProjectForm({ project, token, onSave, onClose }: ProjectFormProps) {
  const [title, setTitle] = useState(project?.title || "");
  const [slug, setSlug] = useState(project?.slug || "");
  const [description, setDescription] = useState(project?.description || "");
  const [coverImage, setCoverImage] = useState(project?.cover_image || "");
  const [images, setImages] = useState<string[]>(project?.images || []);
  const [features, setFeatures] = useState<string[]>(project?.features || []);
  const [tools, setTools] = useState<string[]>(project?.tools || []);
  const [githubUrl, setGithubUrl] = useState(project?.github_url || "");
  const [liveUrl, setLiveUrl] = useState(project?.live_url || "");
  const [featured, setFeatured] = useState(project?.featured || false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const coverInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const generateSlug = (t: string) => {
    return t
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!project) {
      setSlug(generateSlug(val));
    }
  };

  const handleFileUpload = async (
    file: File,
    target: "cover" | "gallery",
  ) => {
    setError("");
    try {
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve) => {
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });

      const result = await adminCloudinaryUpload({
        file: base64,
        folder: "portfolio",
        token,
      });

      if (target === "cover") {
        setCoverImage(result.url);
      } else {
        setImages([...images, result.url]);
      }
    } catch (err: any) {
      setError(err.message || "Upload failed");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await onSave({
        title,
        slug,
        description,
        cover_image: coverImage || null,
        images,
        features: features.filter((f) => f.trim()),
        tools: tools.filter((t) => t.trim()),
        github_url: githubUrl || null,
        live_url: liveUrl || null,
        featured,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to save project");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative glass max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-display font-semibold">
            {project ? "Edit Project" : "Add Project"}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-white/50 hover:text-white hover:bg-white/10"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm text-white/70">Title *</label>
              <Input
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Project title"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm text-white/70">Slug *</label>
              <Input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="project-slug"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm text-white/70">Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Project description..."
              rows={3}
            />
          </div>

          {/* Cover Image */}
          <div className="space-y-1.5">
            <label className="text-sm text-white/70">Cover Image</label>
            <div className="flex items-center gap-3">
              {coverImage && (
                <img
                  src={coverImage}
                  alt="Cover"
                  className="w-20 h-20 rounded-lg object-cover border border-white/10"
                />
              )}
              <div>
                <input
                  ref={coverInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file, "cover");
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => coverInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {coverImage ? "Change" : "Upload Cover"}
                </Button>
              </div>
              {coverImage && (
                <button
                  type="button"
                  onClick={() => setCoverImage("")}
                  className="p-1 text-red-400 hover:text-red-300"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Gallery Images */}
          <div className="space-y-1.5">
            <label className="text-sm text-white/70">Gallery Images</label>
            <div className="flex flex-wrap gap-2">
              {images.map((img, i) => (
                <div key={i} className="relative group">
                  <img
                    src={img}
                    alt={`Gallery ${i + 1}`}
                    className="w-16 h-16 rounded-lg object-cover border border-white/10"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setImages(images.filter((_, j) => j !== i))
                    }
                    className="absolute -top-1 -right-1 p-0.5 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              <div>
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file, "gallery");
                  }}
                />
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  className="w-16 h-16 rounded-lg border border-dashed border-white/20 flex items-center justify-center text-white/40 hover:text-white/70 hover:border-white/40 transition-colors"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-1.5">
            <label className="text-sm text-white/70">Features</label>
            <div className="space-y-2">
              {features.map((feat, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    value={feat}
                    onChange={(e) => {
                      const next = [...features];
                      next[i] = e.target.value;
                      setFeatures(next);
                    }}
                    placeholder="Feature..."
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setFeatures(features.filter((_, j) => j !== i))
                    }
                    className="p-2 text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setFeatures([...features, ""])}
              >
                <Plus className="h-4 w-4 mr-1" /> Add Feature
              </Button>
            </div>
          </div>

          {/* Tools */}
          <div className="space-y-1.5">
            <label className="text-sm text-white/70">Tools</label>
            <div className="space-y-2">
              {tools.map((tool, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    value={tool}
                    onChange={(e) => {
                      const next = [...tools];
                      next[i] = e.target.value;
                      setTools(next);
                    }}
                    placeholder="Tool..."
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setTools(tools.filter((_, j) => j !== i))
                    }
                    className="p-2 text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setTools([...tools, ""])}
              >
                <Plus className="h-4 w-4 mr-1" /> Add Tool
              </Button>
            </div>
          </div>

          {/* URLs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm text-white/70">GitHub URL</label>
              <Input
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://github.com/..."
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm text-white/70">Live URL</label>
              <Input
                value={liveUrl}
                onChange={(e) => setLiveUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>
          </div>

          {/* Featured toggle */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
              className="w-4 h-4 rounded border-white/20 bg-white/5 text-brand-purple focus:ring-brand-purple/30"
            />
            <span className="text-sm text-white/70">Featured project</span>
          </label>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : project ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
