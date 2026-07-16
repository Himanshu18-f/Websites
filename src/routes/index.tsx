import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-white/50">Loading...</p>
    </div>
  );
}
