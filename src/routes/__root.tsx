import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
} from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Navbar } from "~/components/layout/navbar";
import { Footer } from "~/components/layout/footer";

import appCss from "~/styles/app.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Himanshu Jaiswal | AI-Assisted Digital Creator" },
      {
        name: "description",
        content:
          "Premium portfolio of Himanshu Jaiswal — an AI-Assisted Digital Creator building modern websites, AI-powered solutions, and digital experiences.",
      },
      { property: "og:title", content: "Himanshu Jaiswal | AI-Assisted Digital Creator" },
      {
        property: "og:description",
        content:
          "Turning ideas into modern websites, AI-powered solutions, and premium digital experiences.",
      },
      { property: "og:type", content: "website" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      {
        rel: "preconnect",
        href: "https://fonts.googleapis.com",
      },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap",
      },
    ],
  }),
  notFoundComponent: () => (
    <div className="min-h-screen flex items-center justify-center bg-brand-black">
      <p className="text-white/50">Page not found</p>
    </div>
  ),
  component: RootComponent,
});

function RootComponent() {
  return (
    <RootDocument>
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </RootDocument>
  );
}

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
      </head>
      <body className="min-h-screen bg-brand-black text-white antialiased">
        {children}
        <Scripts />
      </body>
    </html>
  );
}
