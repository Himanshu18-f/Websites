import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { LoadingScreen } from "~/components/loading-screen";
import { Hero } from "~/components/hero";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const [loading, setLoading] = useState(true);

  if (loading) {
    return <LoadingScreen onComplete={() => setLoading(false)} />;
  }

  return <Hero />;
}
