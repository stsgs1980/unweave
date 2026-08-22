"use client";

/**
 * @file Main entry point for the web application dashboard.
 * @description Renders the initial dashboard layout matching the UI reference.
 */

import React, { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import ExtractInput from "@/components/dashboard/ExtractInput";
import StatsCard from "@/components/dashboard/StatsCard";
import RecentProjects, { Project } from "@/components/dashboard/RecentProjects";
import ExtractWizard from "@/components/wizard/ExtractWizard";
import LivePipelineWidget from "@/components/dashboard/LivePipelineWidget";
import { useUIStore } from "@/store/ui-store";
import { useWizardStore } from "@/store/wizard-store";

/**
 * Dashboard component representing the main landing page.
 * @returns The rendered dashboard page.
 */
export default function Dashboard() {
  const isWizardOpen = useWizardStore((state) => state.isOpen);

  // Use TanStack Query to fetch projects
  const {
    data: projects,
    isLoading,
    isError,
    error,
  } = useQuery<Project[]>({
    queryKey: ["projects"],
    queryFn: async (): Promise<Project[]> => {
      const response = await fetch("/api/projects");
      if (!response.ok) {
        throw new Error("Failed to load projects");
      }
      return response.json();
    },
  });

  // Error handling via effect (TanStack Query v5 removed onError from useQuery)
  useEffect(() => {
    if (isError && error) {
      toast.error(error.message);
    }
  }, [isError, error]);

  const projectsData = projects ?? [];

  // Get completed jobs count for stats
  const { data: stats } = useQuery<{ completedCount: number }>({
    queryKey: ["stats"],
    queryFn: async () => {
      const response = await fetch("/api/stats");
      if (!response.ok) {
        throw new Error("Failed to load stats");
      }
      return response.json();
    },
  });

  const completedCount = stats?.completedCount ?? 0;

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
            value={completedCount}
            description="Total completed extractions"
            data={[10, 15, 12, 20, 18, 25, 30, 28, completedCount]}
          />
          <StatsCard
            title="Design Tokens"
            value={0}
            description="Updated recently"
            data={[0, 0, 0, 0]}
          />
          <StatsCard
            title="References Saved"
            value={projectsData.length}
            description="Synced with database"
            data={[1, 3, 2, 4, 5, 4, 6, projectsData.length]}
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
            <RecentProjects projects={projectsData} />
          )}
        </div>
      </section>

      {/* Extract Wizard Modal */}
      {isWizardOpen && <ExtractWizard />}
    </main>
  );
}
