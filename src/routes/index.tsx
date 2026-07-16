import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { LoadingScreen } from "~/components/loading-screen";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const [loading, setLoading] = useState(true);

  if (loading) {
    return <LoadingScreen onComplete={() => setLoading(false)} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-black">
      <p className="text-white/30 text-sm font-sans tracking-wider">
        Welcome — hero section coming soon
      </p>
    </div>
  );
}
