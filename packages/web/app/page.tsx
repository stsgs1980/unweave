"use client";

/**
 * @file Main entry point for the web application dashboard.
 * @description Renders the initial dashboard layout matching the UI reference.
 */

import React, { useEffect, useState } from "react";
import ExtractInput from "@/components/dashboard/ExtractInput";
import StatsCard from "@/components/dashboard/StatsCard";
import RecentProjects, { Project } from "@/components/dashboard/RecentProjects";
import ExtractWizard from "@/components/wizard/ExtractWizard";
import LivePipelineWidget from "@/components/dashboard/LivePipelineWidget"; // <-- Добавлен импорт
import { useUIStore } from "@/store/ui-store";

/**
 * Dashboard component representing the main landing page.
 * @returns The rendered dashboard page.
 */
export default function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const isWizardOpen = useUIStore((state) => state.isWizardOpen);

  useEffect(() => {
    const fetchProjects = async (): Promise<void> => {
      try {
        const response = await fetch("/api/projects");
        if (response.ok) {
          const data = await response.json();
          setProjects(data);
        }
      } catch (error) {
        console.error("[FAIL] Failed to load projects:", error);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchProjects();
  }, []);

  return (
    <main className="flex h-[calc(100vh-65px)] flex-col p-8 overflow-y-auto">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to unweave web interface.</p>
      </header>

      <section className="flex flex-1 flex-col gap-8">
        {/* Hero extract input */}
        <div className="rounded-lg border border-border p-6">
          <ExtractInput />
        </div>

        {/* Live Pipeline Widget (SSE) */}
        <LivePipelineWidget />

        {/* Stats cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <StatsCard
            title="Components Extracted"
            value={142}
            description="+12 this week"
            data={[10, 15, 12, 20, 18, 25, 30, 28, 35]}
          />
          <StatsCard
            title="Design Tokens"
            value={89}
            description="Updated 2 days ago"
            data={[5, 8, 10, 9, 12, 15, 14, 18]}
          />
          <StatsCard
            title="References Saved"
            value={projects.length}
            description="Synced with Core"
            data={[1, 3, 2, 4, 5, 4, 6, 8]}
          />
        </div>

        {/* Recent projects grid */}
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold text-foreground">Recent Projects</h2>
          {isLoading ? (
            <div className="flex h-32 items-center justify-center rounded-lg border border-border">
              <p className="text-sm text-muted-foreground">Loading...</p>
            </div>
          ) : (
            <RecentProjects projects={projects} />
          )}
        </div>
      </section>

      {/* Extract Wizard Modal */}
      {isWizardOpen && <ExtractWizard />}
    </main>
  );
}
