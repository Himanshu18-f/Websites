import { useState, useEffect } from "react";
import { NAV_ITEMS, SITE_NAME } from "~/lib/constants";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { Menu, X } from "lucide-react";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (href: string) => {
    setMobileOpen(false);
    if (href === "#home") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const el = document.querySelector(href);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        scrolled
          ? "bg-black/60 backdrop-blur-xl border-b border-white/10 shadow-lg shadow-black/20"
          : "bg-transparent",
      )}
    >
      <nav className="mx-auto max-w-7xl flex items-center justify-between px-6 py-4">
        {/* Logo */}
        <a
          href="#home"
          onClick={(e) => {
            e.preventDefault();
            handleNavClick("#home");
          }}
          className="text-2xl font-bold font-display tracking-tight text-white hover:text-brand-purple-light transition-colors"
        >
          <span className="text-brand-purple">H</span>J
        </a>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.label}
              onClick={() => handleNavClick(item.href)}
              className="px-4 py-2 text-sm text-white/60 hover:text-white transition-colors rounded-lg hover:bg-white/5"
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:block">
          <Button
            variant="glow"
            size="sm"
            onClick={() => handleNavClick("#contact")}
          >
            Hire Me
          </Button>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-white/70 hover:text-white transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/10 bg-black/90 backdrop-blur-xl animate-in slide-in-from-top">
          <div className="flex flex-col gap-1 px-4 py-4">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.label}
                onClick={() => handleNavClick(item.href)}
                className="px-4 py-3 text-sm text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors text-left"
              >
                {item.label}
              </button>
            ))}
            <div className="pt-2">
              <Button
                variant="glow"
                className="w-full"
                onClick={() => handleNavClick("#contact")}
              >
                Hire Me
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
