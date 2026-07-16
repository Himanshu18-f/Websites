import { SOCIAL_LINKS, SITE_NAME } from "~/lib/constants";
import { FiGithub, FiLinkedin, FiInstagram, FiMail } from "react-icons/fi";

export function Footer() {
  const currentYear = new Date().getFullYear();

  const socialIcons = [
    { href: SOCIAL_LINKS.github, icon: FiGithub, label: "GitHub" },
    { href: SOCIAL_LINKS.linkedin, icon: FiLinkedin, label: "LinkedIn" },
    { href: SOCIAL_LINKS.instagram, icon: FiInstagram, label: "Instagram" },
    { href: SOCIAL_LINKS.email, icon: FiMail, label: "Email" },
  ];

  return (
    <footer className="border-t border-white/10 bg-black/40 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <p className="text-sm text-white/40">
          &copy; {currentYear} {SITE_NAME}. All rights reserved.
        </p>

        <div className="flex items-center gap-4">
          {socialIcons.map(({ href, icon: Icon, label }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className="text-white/40 hover:text-brand-purple-light transition-colors"
            >
              <Icon size={20} />
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
