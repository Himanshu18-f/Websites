import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Save, Loader2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { FileUpload } from "~/components/admin/file-upload";
import {
  adminGetSettings,
  adminUpdateSettings,
  type SiteSettings,
} from "~/server/admin";

export const Route = createFileRoute("/admin/settings")({
  component: AdminSettings,
});

function AdminSettings() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    adminGetSettings().then((data) => {
      setSettings(data);
      setLoading(false);
    });
  }, []);

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    setSaved(false);
    try {
      await adminUpdateSettings(settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error("Failed to save settings:", err);
    } finally {
      setSaving(false);
    }
  };

  const update = (key: keyof SiteSettings, value: string) => {
    if (!settings) return;
    setSettings({ ...settings, [key]: value });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-brand-purple" />
      </div>
    );
  }

  if (!settings) {
    return <p className="text-white/40">Failed to load settings.</p>;
  }

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h2 className="text-2xl font-display font-semibold">Settings</h2>
        <p className="text-sm text-white/40 mt-1">
          Customize your portfolio content
        </p>
      </div>

      {/* Hero Section */}
      <section className="glass p-6 space-y-4">
        <h3 className="text-sm font-medium text-white/50 uppercase tracking-wider">
          Hero Section
        </h3>
        <div className="space-y-1.5">
          <label className="text-sm text-white/70">Heading</label>
          <Input
            value={settings.hero_heading}
            onChange={(e) => update("hero_heading", e.target.value)}
            placeholder="Your name or main heading"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm text-white/70">Subheading</label>
          <Textarea
            value={settings.hero_subheading}
            onChange={(e) => update("hero_subheading", e.target.value)}
            placeholder="Brief tagline or description"
            rows={2}
          />
        </div>
      </section>

      {/* About Section */}
      <section className="glass p-6 space-y-4">
        <h3 className="text-sm font-medium text-white/50 uppercase tracking-wider">
          About Section
        </h3>
        <div className="space-y-1.5">
          <label className="text-sm text-white/70">About Content</label>
          <Textarea
            value={settings.about_content}
            onChange={(e) => update("about_content", e.target.value)}
            placeholder="Write about yourself, your journey, and your skills..."
            rows={6}
          />
        </div>
      </section>

      {/* Resume */}
      <section className="glass p-6 space-y-4">
        <h3 className="text-sm font-medium text-white/50 uppercase tracking-wider">
          Resume
        </h3>
        <div className="space-y-1.5">
          <label className="text-sm text-white/70">Resume PDF</label>
          <FileUpload
            type="raw"
            accept=".pdf"
            label="Upload Resume (PDF)"
            currentUrl={settings.resume_url}
            onUpload={(url) => update("resume_url", url)}
          />
        </div>
      </section>

      {/* Social Links */}
      <section className="glass p-6 space-y-4">
        <h3 className="text-sm font-medium text-white/50 uppercase tracking-wider">
          Social Links
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm text-white/70">GitHub URL</label>
            <Input
              value={settings.github_url}
              onChange={(e) => update("github_url", e.target.value)}
              placeholder="https://github.com/..."
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm text-white/70">LinkedIn URL</label>
            <Input
              value={settings.linkedin_url}
              onChange={(e) => update("linkedin_url", e.target.value)}
              placeholder="https://linkedin.com/in/..."
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm text-white/70">Instagram URL</label>
            <Input
              value={settings.instagram_url}
              onChange={(e) => update("instagram_url", e.target.value)}
              placeholder="https://instagram.com/..."
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm text-white/70">Threads URL</label>
            <Input
              value={settings.threads_url}
              onChange={(e) => update("threads_url", e.target.value)}
              placeholder="https://threads.net/..."
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-sm text-white/70">Email</label>
            <Input
              value={settings.email}
              onChange={(e) => update("email", e.target.value)}
              placeholder="your@email.com"
              type="email"
            />
          </div>
        </div>
      </section>

      {/* Save */}
      <div className="flex items-center gap-3">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Settings
            </>
          )}
        </Button>
        {saved && (
          <span className="text-sm text-green-400">Settings saved!</span>
        )}
      </div>
    </div>
  );
}
