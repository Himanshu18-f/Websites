import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  FolderKanban,
  Star,
  MessageSquare,
  Plus,
  ArrowRight,
} from "lucide-react";
import { adminGetStats } from "~/server/admin";
import { useAdminToken } from "~/lib/admin-token";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const token = useAdminToken();
  const [stats, setStats] = useState({
    totalProjects: 0,
    pendingReviews: 0,
    unreadMessages: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    adminGetStats({ token }).then((data) => {
      setStats(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [token]);

  const cards = [
    {
      label: "Total Projects",
      value: stats.totalProjects,
      icon: FolderKanban,
      color: "text-brand-purple-light",
      bg: "bg-brand-purple/10",
      border: "border-brand-purple/20",
    },
    {
      label: "Pending Reviews",
      value: stats.pendingReviews,
      icon: Star,
      color: "text-yellow-400",
      bg: "bg-yellow-500/10",
      border: "border-yellow-500/20",
    },
    {
      label: "Unread Messages",
      value: stats.unreadMessages,
      icon: MessageSquare,
      color: "text-brand-blue",
      bg: "bg-brand-blue/10",
      border: "border-brand-blue/20",
    },
  ];

  const quickActions = [
    { label: "Add Project", to: "/admin/projects", icon: Plus },
    { label: "View Reviews", to: "/admin/reviews", icon: Star },
    { label: "Check Messages", to: "/admin/messages", icon: MessageSquare },
  ];

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h2 className="text-2xl font-display font-semibold">Dashboard</h2>
        <p className="text-sm text-white/40 mt-1">
          Overview of your portfolio site
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className={`glass p-5 border ${card.border} space-y-3`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/50">{card.label}</span>
              <div className={`p-2 rounded-lg ${card.bg}`}>
                <card.icon className={`h-5 w-5 ${card.color}`} />
              </div>
            </div>
            <div className="text-3xl font-display font-bold">
              {loading ? (
                <span className="text-white/20">—</span>
              ) : (
                card.value
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div>
        <h3 className="text-sm font-medium text-white/50 uppercase tracking-wider mb-3">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {quickActions.map((action) => (
            <Link
              key={action.to}
              to={action.to}
              className="glass p-4 flex items-center justify-between group hover:border-brand-purple/30 transition-all duration-300"
            >
              <div className="flex items-center gap-3">
                <action.icon className="h-5 w-5 text-brand-purple-light" />
                <span className="text-sm">{action.label}</span>
              </div>
              <ArrowRight className="h-4 w-4 text-white/30 group-hover:text-brand-purple-light group-hover:translate-x-0.5 transition-all" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
