"use client";

/**
 * @file Workspace page for viewing extraction results.
 */

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ExternalLink, Layers, ArrowLeft, RefreshCw } from "lucide-react";
import { useWizardStore } from "@/store/wizard-store";
import { Button } from "@/components/ui/button";
import ComponentTree from "./ComponentTree";
import CodePreview from "./CodePreview";

/**
 * Inner component that uses useSearchParams (requires Suspense boundary).
 * @returns The workspace content with component tree and code preview.
 */
function WorkspaceContent() {
  const searchParams = useSearchParams();
  const urlJobId = searchParams.get("jobId");
  const wizardJobId = useWizardStore((state) => state.jobId);
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);

  // Fetch recent projects if no jobId in URL or store
  const { data: recentProjects = [] } = useQuery<any[]>({
    queryKey: ["projects"],
    queryFn: async (): Promise<any[]> => {
      const response = await fetch("/api/projects");
      if (!response.ok) return [];
      return response.json();
    },
    enabled: !urlJobId && !wizardJobId,
  });

  // Effective job ID: URL param -> wizard store -> latest completed/recent project
  const effectiveJobId =
    urlJobId ||
    wizardJobId ||
    recentProjects.find((p) => p.status?.toLowerCase() === "completed")?.id ||
    recentProjects[0]?.id ||
    null;

  // Fetch extraction results using TanStack Query
  const {
    data: resultsData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["workspace", "results", effectiveJobId],
    queryFn: async (): Promise<any> => {
      if (!effectiveJobId) return null;
      const response = await fetch(`/api/results/${effectiveJobId}`);
      if (!response.ok) {
        throw new Error("Failed to load results for this project");
      }
      return response.json();
    },
    enabled: !!effectiveJobId,
  });

  const components: any[] = resultsData?.analysis?.components || [];
  const projectUrl: string = resultsData?.url || resultsData?.analysis?.url || "";

  // Auto-select first component when components load
  useEffect(() => {
    if (components.length > 0 && !selectedComponent) {
      const first = components[0];
      const name = first.name || first.tagName;
      if (name) setSelectedComponent(name);
    }
  }, [components, selectedComponent]);

  if (!effectiveJobId && !isLoading) {
    return (
      <main className="flex h-[calc(100vh-65px)] flex-col items-center justify-center p-8 text-center">
        <div className="rounded-full bg-muted p-4 mb-4">
          <Layers className="h-8 w-8 text-muted-foreground" />
        </div>
        <h1 className="text-xl font-bold text-foreground">No Extraction Selected</h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-md">
          Run a new website extraction on the Dashboard to inspect components and design tokens in
          Workspace.
        </p>
        <div className="mt-6">
          <Link href="/">
            <Button className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Go to Dashboard
            </Button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex h-[calc(100vh-65px)] flex-col">
      <header className="flex items-center justify-between border-b border-border px-6 py-3 bg-card/50">
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-foreground">Workspace Studio</h1>
              {effectiveJobId && (
                <span className="rounded bg-muted px-2 py-0.5 font-mono text-[11px] text-muted-foreground">
                  {effectiveJobId.slice(0, 8)}...
                </span>
              )}
            </div>
            {projectUrl && (
              <a
                href={projectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-0.5 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground hover:underline"
              >
                <span>{projectUrl}</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
            className="h-8 gap-1.5 text-xs text-muted-foreground"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </Button>
          <Link href="/">
            <Button variant="outline" size="sm" className="h-8 text-xs">
              New Extract
            </Button>
          </Link>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel: Component Tree */}
        <aside className="w-80 border-r border-border overflow-y-auto p-4 bg-card/20">
          {isLoading ? (
            <div className="py-8 text-center text-xs text-muted-foreground animate-pulse">
              Loading components...
            </div>
          ) : isError ? (
            <div className="p-3 text-xs text-destructive bg-destructive/10 rounded-md border border-destructive/20">
              Error: {error?.message}
            </div>
          ) : (
            <ComponentTree
              components={components}
              selectedComponent={selectedComponent}
              onSelect={setSelectedComponent}
            />
          )}
        </aside>

        {/* Right Panel: Code Preview */}
        <section className="flex-1 overflow-y-auto p-6 bg-background">
          <CodePreview componentName={selectedComponent} jobId={effectiveJobId} />
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
          <p className="text-sm text-muted-foreground">Loading workspace...</p>
        </div>
      }
    >
      <WorkspaceContent />
    </Suspense>
  );
}
