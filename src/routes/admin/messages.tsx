import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { Mail, MailOpen, Trash2 } from "lucide-react";
import { DataTable } from "~/components/admin/data-table";
import { ConfirmDialog } from "~/components/admin/confirm-dialog";
import {
  adminGetMessages,
  adminToggleReadMessage,
  adminDeleteMessage,
} from "~/server/admin";
import { useAdminToken } from "~/lib/admin-token";
import type { ContactMessage } from "~/lib/database.types";

export const Route = createFileRoute("/admin/messages")({
  component: AdminMessages,
});

function AdminMessages() {
  const token = useAdminToken();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ContactMessage | null>(null);

  const loadMessages = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await adminGetMessages({ token });
      setMessages(data);
    } catch (err) {
      console.error("Failed to load messages:", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  const handleToggleRead = async (id: string, currentRead: boolean) => {
    await adminToggleReadMessage({ id, token, read: !currentRead });
    await loadMessages();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await adminDeleteMessage({ id: deleteTarget.id, token });
    setDeleteTarget(null);
    await loadMessages();
  };

  const columns = [
    {
      key: "read",
      header: "",
      render: (m: ContactMessage) =>
        m.read ? (
          <MailOpen className="h-4 w-4 text-white/20" />
        ) : (
          <Mail className="h-4 w-4 text-brand-blue" />
        ),
      className: "w-10",
    },
    {
      key: "name",
      header: "Name",
      render: (m: ContactMessage) => (
        <span className={m.read ? "text-white/60" : "text-white/90 font-medium"}>
          {m.name}
        </span>
      ),
    },
    {
      key: "email",
      header: "Email",
      render: (m: ContactMessage) => (
        <a
          href={`mailto:${m.email}`}
          className="text-brand-blue/70 hover:text-brand-blue text-xs"
        >
          {m.email}
        </a>
      ),
    },
    {
      key: "message",
      header: "Message",
      render: (m: ContactMessage) => (
        <div className="max-w-xs">
          <span className="text-white/40 text-xs line-clamp-1">
            {m.message}
          </span>
          <button
            onClick={() =>
              setExpandedId(expandedId === m.id ? null : m.id)
            }
            className="text-brand-purple-light text-xs hover:underline mt-0.5"
          >
            {expandedId === m.id ? "Show less" : "Read more"}
          </button>
        </div>
      ),
    },
    {
      key: "created_at",
      header: "Date",
      render: (m: ContactMessage) => (
        <span className="text-white/40 text-xs">
          {new Date(m.created_at).toLocaleDateString()}
        </span>
      ),
      className: "w-24",
    },
    {
      key: "actions",
      header: "Actions",
      render: (m: ContactMessage) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleToggleRead(m.id, m.read)}
            className="p-1.5 rounded-md text-white/40 hover:text-brand-blue hover:bg-white/10 transition-colors"
            title={m.read ? "Mark unread" : "Mark read"}
          >
            {m.read ? (
              <Mail className="h-4 w-4" />
            ) : (
              <MailOpen className="h-4 w-4" />
            )}
          </button>
          <button
            onClick={() => setDeleteTarget(m)}
            className="p-1.5 rounded-md text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
      className: "w-24",
    },
  ];

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h2 className="text-2xl font-display font-semibold">Messages</h2>
        <p className="text-sm text-white/40 mt-1">
          Contact form submissions from visitors
        </p>
      </div>

      <div className="glass">
        <DataTable
          columns={columns}
          data={messages}
          keyField="id"
          loading={loading}
          emptyMessage="No messages received yet."
        />
      </div>

      {/* Expanded message content */}
      {expandedId && (
        <div className="glass p-4 space-y-2">
          {(() => {
            const msg = messages.find((m) => m.id === expandedId);
            if (!msg) return null;
            return (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium text-white/90">
                      {msg.name}
                    </span>
                    <span className="text-white/40 mx-2">•</span>
                    <a
                      href={`mailto:${msg.email}`}
                      className="text-brand-blue text-sm"
                    >
                      {msg.email}
                    </a>
                  </div>
                  <span className="text-xs text-white/30">
                    {new Date(msg.created_at).toLocaleString()}
                  </span>
                </div>
                <p className="text-white/70 text-sm whitespace-pre-wrap">
                  {msg.message}
                </p>
              </>
            );
          })()}
        </div>
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete Message"
          message={`Delete this message from ${deleteTarget.name}?`}
          confirmLabel="Delete"
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
