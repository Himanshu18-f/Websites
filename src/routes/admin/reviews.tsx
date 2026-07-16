import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { Check, X, Pin, PinOff, Trash2 } from "lucide-react";
import { DataTable } from "~/components/admin/data-table";
import { ConfirmDialog } from "~/components/admin/confirm-dialog";
import {
  adminGetReviews,
  adminApproveReview,
  adminRejectReview,
  adminTogglePinReview,
  adminDeleteReview,
} from "~/server/admin";
import { useAdminToken } from "~/lib/admin-token";
import type { Review } from "~/lib/database.types";

export const Route = createFileRoute("/admin/reviews")({
  component: AdminReviews,
});

function AdminReviews() {
  const token = useAdminToken();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Review | null>(null);

  const loadReviews = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await adminGetReviews({ token });
      setReviews(data);
    } catch (err) {
      console.error("Failed to load reviews:", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const handleApprove = async (id: string) => {
    await adminApproveReview({ id, token });
    await loadReviews();
  };

  const handleReject = async (id: string) => {
    await adminRejectReview({ id, token });
    await loadReviews();
  };

  const handleTogglePin = async (id: string, pinned: boolean) => {
    await adminTogglePinReview({ id, token, pinned: !pinned });
    await loadReviews();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await adminDeleteReview({ id: deleteTarget.id, token });
    setDeleteTarget(null);
    await loadReviews();
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`h-3.5 w-3.5 ${
              star <= rating
                ? "text-yellow-400 fill-yellow-400"
                : "text-white/20"
            }`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  const columns = [
    {
      key: "author_name",
      header: "Author",
      render: (r: Review) => (
        <span className="text-white/90">
          {r.author_name || "Anonymous"}
        </span>
      ),
    },
    {
      key: "rating",
      header: "Rating",
      render: (r: Review) => renderStars(r.rating),
      className: "w-28",
    },
    {
      key: "content",
      header: "Review",
      render: (r: Review) => (
        <span className="text-white/50 text-xs line-clamp-2 max-w-xs">
          {r.content}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (r: Review) =>
        r.approved ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-green-500/10 text-green-400 border border-green-500/20">
            <Check className="h-3 w-3" /> Approved
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
            Pending
          </span>
        ),
      className: "w-28",
    },
    {
      key: "created_at",
      header: "Date",
      render: (r: Review) => (
        <span className="text-white/40 text-xs">
          {new Date(r.created_at).toLocaleDateString()}
        </span>
      ),
      className: "w-24",
    },
    {
      key: "actions",
      header: "Actions",
      render: (r: Review) => (
        <div className="flex items-center gap-1">
          {!r.approved ? (
            <button
              onClick={() => handleApprove(r.id)}
              className="p-1.5 rounded-md text-white/40 hover:text-green-400 hover:bg-green-500/10 transition-colors"
              title="Approve"
            >
              <Check className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={() => handleReject(r.id)}
              className="p-1.5 rounded-md text-white/40 hover:text-yellow-400 hover:bg-yellow-500/10 transition-colors"
              title="Reject"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={() => handleTogglePin(r.id, r.pinned)}
            className={`p-1.5 rounded-md transition-colors ${
              r.pinned
                ? "text-brand-purple-light hover:bg-brand-purple/10"
                : "text-white/40 hover:text-white hover:bg-white/10"
            }`}
            title={r.pinned ? "Unpin" : "Pin"}
          >
            {r.pinned ? (
              <PinOff className="h-4 w-4" />
            ) : (
              <Pin className="h-4 w-4" />
            )}
          </button>
          <button
            onClick={() => setDeleteTarget(r)}
            className="p-1.5 rounded-md text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
      className: "w-36",
    },
  ];

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h2 className="text-2xl font-display font-semibold">Reviews</h2>
        <p className="text-sm text-white/40 mt-1">
          Moderate and manage client reviews
        </p>
      </div>

      <div className="glass">
        <DataTable
          columns={columns}
          data={reviews}
          keyField="id"
          loading={loading}
          emptyMessage="No reviews submitted yet."
        />
      </div>

      {deleteTarget && (
        <ConfirmDialog
          title="Delete Review"
          message={`Delete this review by ${deleteTarget.author_name || "Anonymous"}?`}
          confirmLabel="Delete"
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
