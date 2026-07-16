import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { Plus, Pencil, Trash2, Star, ExternalLink } from "lucide-react";
import { Button } from "~/components/ui/button";
import { DataTable } from "~/components/admin/data-table";
import { ProjectForm } from "~/components/admin/project-form";
import { ConfirmDialog } from "~/components/admin/confirm-dialog";
import {
  adminGetProjects,
  adminCreateProject,
  adminUpdateProject,
  adminDeleteProject,
} from "~/server/admin";
import { useAdminToken } from "~/lib/admin-token";
import type { Project } from "~/lib/database.types";

export const Route = createFileRoute("/admin/projects")({
  component: AdminProjects,
});

function AdminProjects() {
  const token = useAdminToken();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const loadProjects = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await adminGetProjects({ token });
      setProjects(data);
    } catch (err) {
      console.error("Failed to load projects:", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const handleCreate = async (
    formData: Omit<Parameters<typeof adminCreateProject>[0], "token">,
  ) => {
    await adminCreateProject({ ...formData, token } as any);
    await loadProjects();
  };

  const handleUpdate = async (
    formData: Omit<Parameters<typeof adminCreateProject>[0], "token">,
  ) => {
    if (!editingProject) return;
    await adminUpdateProject({
      id: editingProject.id,
      updates: formData,
      token,
    } as any);
    setEditingProject(null);
    await loadProjects();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await adminDeleteProject({ id: deleteTarget.id, token });
      setDeleteTarget(null);
      await loadProjects();
    } catch (err) {
      console.error("Failed to delete project:", err);
    } finally {
      setDeleteLoading(false);
    }
  };

  const columns = [
    {
      key: "title",
      header: "Project",
      render: (p: Project) => (
        <div className="flex items-center gap-3">
          {p.cover_image && (
            <img
              src={p.cover_image}
              alt={p.title}
              className="w-10 h-10 rounded-md object-cover border border-white/10"
            />
          )}
          <div>
            <div className="font-medium text-white/90">{p.title}</div>
            <div className="text-xs text-white/40">{p.slug}</div>
          </div>
        </div>
      ),
    },
    {
      key: "featured",
      header: "Featured",
      render: (p: Project) =>
        p.featured ? (
          <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
        ) : (
          <span className="text-white/20">—</span>
        ),
      className: "w-20",
    },
    {
      key: "created_at",
      header: "Date",
      render: (p: Project) => (
        <span className="text-white/50 text-xs">
          {new Date(p.created_at).toLocaleDateString()}
        </span>
      ),
      className: "w-28",
    },
    {
      key: "actions",
      header: "Actions",
      render: (p: Project) => (
        <div className="flex items-center gap-1">
          {p.live_url && (
            <a
              href={p.live_url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-md text-white/40 hover:text-brand-blue hover:bg-white/10 transition-colors"
              title="View Live"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
          {p.github_url && (
            <a
              href={p.github_url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-md text-white/40 hover:text-white hover:bg-white/10 transition-colors"
              title="View GitHub"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
          <button
            onClick={() => {
              setEditingProject(p);
              setShowForm(true);
            }}
            className="p-1.5 rounded-md text-white/40 hover:text-brand-purple-light hover:bg-white/10 transition-colors"
            title="Edit"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={() => setDeleteTarget(p)}
            className="p-1.5 rounded-md text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
      className: "w-40",
    },
  ];

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-semibold">Projects</h2>
          <p className="text-sm text-white/40 mt-1">
            Manage your portfolio projects
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingProject(null);
            setShowForm(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Project
        </Button>
      </div>

      <div className="glass">
        <DataTable
          columns={columns}
          data={projects}
          keyField="id"
          loading={loading}
          emptyMessage="No projects yet. Click 'Add Project' to create one."
        />
      </div>

      {/* Project form modal */}
      {showForm && (
        <ProjectForm
          project={editingProject}
          token={token}
          onSave={
            editingProject
              ? (formData) =>
                  adminUpdateProject({
                    id: editingProject.id,
                    updates: formData,
                    token,
                  }).then(() => {
                    setShowForm(false);
                    setEditingProject(null);
                    loadProjects();
                  })
              : (formData) =>
                  adminCreateProject({ ...formData, token } as any).then(() => {
                    setShowForm(false);
                    loadProjects();
                  })
          }
          onClose={() => {
            setShowForm(false);
            setEditingProject(null);
          }}
        />
      )}

      {/* Delete confirmation */}
      {deleteTarget && (
        <ConfirmDialog
          title="Delete Project"
          message={`Are you sure you want to delete "${deleteTarget.title}"? This action cannot be undone.`}
          confirmLabel="Delete"
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleteLoading}
        />
      )}
    </div>
  );
}
