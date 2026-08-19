/**
 * @file Main entry point for the web application dashboard.
 * @description Renders the initial dashboard layout matching the UI reference.
 */

import React from "react";
import ExtractInput from "@/components/dashboard/ExtractInput";
import StatsCard from "@/components/dashboard/StatsCard";
import RecentProjects, { Project } from "@/components/dashboard/RecentProjects";

// Mock data for recent projects
const mockProjects: Project[] = [
  {
    id: "1",
    name: "E-commerce Layout",
    url: "https://example-shop.com",
    date: "2023-10-25",
    status: "Completed",
  },
  {
    id: "2",
    name: "SaaS Landing Page",
    url: "https://example-saas.com",
    date: "2023-10-20",
    status: "Completed",
  },
  {
    id: "3",
    name: "Portfolio Site",
    url: "https://example-portfolio.com",
    date: "2023-10-18",
    status: "Failed",
  },
];

/**
 * Dashboard component representing the main landing page.
 * @returns The rendered dashboard page.
 */
export default function Dashboard() {
  return (
    <main className="flex min-h-screen flex-col p-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to unweave web interface.</p>
      </header>

      <section className="flex flex-1 flex-col gap-8">
        {/* Hero extract input */}
        <div className="rounded-lg border border-border p-6">
          <ExtractInput />
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <StatsCard title="Components Extracted" value={142} description="+12 this week" />
          <StatsCard title="Design Tokens" value={89} description="Updated 2 days ago" />
          <StatsCard title="References Saved" value={5} description="Latest: example.com" />
        </div>

        {/* Recent projects grid */}
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold text-foreground">Recent Projects</h2>
          <RecentProjects projects={mockProjects} />
        </div>
      </section>
    </main>
  );
}
