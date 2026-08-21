"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useWizardStore } from "@/store/wizard-store";

/**
 * Renders the global top navigation bar.
 * @returns The rendered navbar.
 */
export default function Navbar() {
  const pathname = usePathname();
  const jobId = useWizardStore((state) => state.jobId);

  const links = [
    { href: "/", label: "Dashboard" },
    { href: "/references", label: "References" },
    { href: jobId ? `/tokens?jobId=${jobId}` : "/tokens", label: "Tokens" },
    { href: jobId ? `/workspace?jobId=${jobId}` : "/workspace", label: "Workspace" },
    { href: "/logs", label: "Logs" },
  ];

  const navClass = "flex items-center gap-6 px-8 py-4 border-b border-border bg-card";
  const linkClass = "text-sm font-medium transition-colors";
  const activeClass = "text-foreground";
  const inactiveClass = "text-muted-foreground hover:text-foreground";

  return (
    <nav className={navClass}>
      <Link href="/" className="text-lg font-bold text-foreground mr-8">
        unweave
      </Link>
      <div className="flex gap-4">
        {links.map((link) => {
          const isActive = pathname === link.href.split("?")[0];
          return (
            <Link
              key={link.label}
              href={link.href}
              className={`${linkClass} ${isActive ? activeClass : inactiveClass}`}
            >
              {link.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
