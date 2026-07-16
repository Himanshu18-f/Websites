import { createFileRoute, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminSidebar } from "~/components/admin/sidebar";
import { adminVerifyToken } from "~/server/admin";

// Helper to get/set/clear token in sessionStorage
function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem("admin_token");
}

function clearToken() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem("admin_token");
}

export const Route = createFileRoute("/admin")({
  beforeLoad: async ({ location }) => {
    // On server, just check for login page exemption
    if (location.pathname === "/admin/login") return;
  },
  component: AdminLayout,
});

function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const isLogin = location.pathname === "/admin/login";
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    if (isLogin) {
      setAuthenticated(null);
      return;
    }

    const token = getToken();
    if (!token) {
      navigate({ to: "/admin/login" });
      return;
    }

    // Verify token is still valid
    adminVerifyToken({ token })
      .then((result) => {
        if (!result.valid) {
          clearToken();
          navigate({ to: "/admin/login" });
        } else {
          setAuthenticated(true);
        }
      })
      .catch(() => {
        clearToken();
        navigate({ to: "/admin/login" });
      });
  }, [location.pathname, isLogin, navigate]);

  // Login page renders without the admin chrome
  if (isLogin) {
    return (
      <div className="min-h-screen bg-brand-black">
        <Outlet />
      </div>
    );
  }

  // Loading state while checking auth
  if (authenticated === null) {
    return (
      <div className="flex h-screen items-center justify-center bg-brand-black">
        <div className="animate-spin h-8 w-8 border-2 border-brand-purple border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-brand-black">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top header bar */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-white/10 bg-brand-black/50 backdrop-blur-xl flex-shrink-0">
          <div>
            <h1 className="font-display font-semibold text-white/90">
              <span className="text-brand-purple-light">HJ</span> Admin
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-white/40">Dashboard</span>
          </div>
        </header>
        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
