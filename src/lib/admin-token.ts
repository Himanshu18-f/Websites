/**
 * Get the admin auth token from sessionStorage.
 * Returns empty string if not found.
 */
export function useAdminToken(): string {
  if (typeof window === "undefined") return "";
  return sessionStorage.getItem("admin_token") || "";
}

export function clearAdminToken() {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem("admin_token");
  }
}

export function setAdminToken(token: string) {
  if (typeof window !== "undefined") {
    sessionStorage.setItem("admin_token", token);
  }
}
