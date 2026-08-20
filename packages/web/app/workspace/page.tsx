"use client";

/**
 * @file Workspace page for viewing extraction results.
 */

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useWizardStore } from "@/store/wizard-store";
import ComponentTree from "./ComponentTree";
import CodePreview from "./CodePreview";

/**
 * Inner component that uses useSearchParams (requires Suspense boundary).
 * @returns The workspace content with component tree and code preview.
 */
function WorkspaceContent() {
  const searchParams = useSearchParams();
  // Если в URL нет jobId, берем последний успешный из стора
  const wizardJobId = useWizardStore((state) => state.jobId);
  const jobId = searchParams.get("jobId") || wizardJobId;
  const [selectedComponent, setSelectedComponent] = React.useState<string | null>(null);

  // Fetch extraction results using TanStack Query
  const {
    data: components = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["workspace", "results", jobId],
    queryFn: async (): Promise<any[]> => {
      if (!jobId) return [];
      const response = await fetch(`/api/results/${jobId}`);
      if (!response.ok) {
        throw new Error("Failed to load results");
      }
      const data = await response.json();
      return data?.analysis?.components || [];
    },
    enabled: !!jobId,
  });

  return (
    <main className="flex h-screen flex-col">
      <header className="border-b border-border p-4">
        <h1 className="text-xl font-bold text-foreground">Workspace</h1>
        <p className="text-sm text-muted-foreground">
          {jobId ? `Results for job: ${jobId}` : "No job ID provided"}
        </p>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel: Component Tree */}
        <aside className="w-1/3 border-r border-border overflow-y-auto p-4">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading components...</p>
          ) : isError ? (
            <p className="text-sm text-destructive">Error: {error?.message}</p>
          ) : (
            <ComponentTree components={components} onSelect={setSelectedComponent} />
          )}
        </aside>

        {/* Right Panel: Code Preview */}
        <section className="flex-1 overflow-y-auto p-4">
          <CodePreview componentName={selectedComponent} jobId={jobId} />
        </section>
      </div>
    </main>
  );
}

/**
 * Renders the split-view workspace layout with Suspense boundary.
 * @returns The workspace page.
 */
export default function WorkspacePage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      }
    >
      <WorkspaceContent />
    </Suspense>
  );
}
