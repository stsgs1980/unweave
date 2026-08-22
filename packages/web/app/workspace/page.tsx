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
import {
  ProcessingStatusView,
  FailedStatusView,
  StatusLoadingView,
  StatusErrorView,
  ResultsLoadingView,
  ResultsErrorView,
  NoComponentsView,
  NoExtractionSelectedView,
} from "./components/StatusViews";

interface JobStatus {
  id: string;
  status: "pending" | "processing" | "completed" | "failed";
  progress: number;
  message?: string;
  error?: string;
  url?: string;
}

/**
 * Inner component that uses useSearchParams (requires Suspense boundary).
 * @returns The workspace content with component tree and code preview.
 */
function WorkspaceContent() {
  const searchParams = useSearchParams();
  const urlJobId = searchParams.get("jobId");
  const wizardJobId = useWizardStore((state) => state.jobId);
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<JobStatus | null>(null);
  const [showResults, setShowResults] = useState(false);

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

  // First, fetch job status
  const {
    data: statusData,
    isLoading: isStatusLoading,
    isError: isStatusError,
    refetch: refetchStatus,
  } = useQuery<JobStatus>({
    queryKey: ["workspace", "status", effectiveJobId],
    queryFn: async (): Promise<JobStatus> => {
      if (!effectiveJobId) throw new Error("No job ID");
      const response = await fetch(`/api/status/${effectiveJobId}`);
      if (!response.ok) {
        throw new Error("Failed to load job status");
      }
      return response.json();
    },
    enabled: !!effectiveJobId,
    refetchInterval: (query) => {
      const data = query.state.data as JobStatus | undefined;
      return data?.status === "processing" || data?.status === "pending" ? 2000 : false;
    },
    retry: 3,
  });

  // Update local job status when statusData changes
  useEffect(() => {
    if (statusData) {
      setJobStatus(statusData);
      // If completed, trigger results fetch
      if (statusData.status === "completed") {
        setShowResults(true);
      } else {
        setShowResults(false);
      }
    }
  }, [statusData]);

  // Fetch extraction results only when job is completed
  const {
    data: resultsData,
    isLoading: isResultsLoading,
    isError: isResultsError,
    error: resultsError,
    refetch: refetchResults,
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
    enabled: showResults && !!effectiveJobId,
    retry: 1,
  });

  const components: any[] = resultsData?.analysis?.components || [];
  const projectUrl: string = resultsData?.url || resultsData?.analysis?.url || jobStatus?.url || "";

  // Auto-select first component when components load
  useEffect(() => {
    if (components.length > 0 && !selectedComponent) {
      const first = components[0];
      const name = first.name || first.tagName;
      if (name) setSelectedComponent(name);
    }
  }, [components, selectedComponent]);

  if (!effectiveJobId && !isStatusLoading) {
    return <NoExtractionSelectedView />;
  }

  if (isStatusLoading) {
    return <StatusLoadingView />;
  }

  if (isStatusError) {
    return <StatusErrorView refetchStatus={refetchStatus} />;
  }

  // Handle job status states
  if (jobStatus) {
    // Processing / Pending - show progress
    if (jobStatus.status === "pending" || jobStatus.status === "processing") {
      return <ProcessingStatusView jobStatus={jobStatus} projectUrl={projectUrl} />;
    }

    // Failed - show error with retry
    if (jobStatus.status === "failed") {
      return (
        <FailedStatusView
          jobStatus={jobStatus}
          refetchStatus={refetchStatus}
          projectUrl={projectUrl}
        />
      );
    }

    // Completed - show results (handled below)
  }

  // If completed but results not loaded yet
  if (showResults && isResultsLoading) {
    return <ResultsLoadingView />;
  }

  // If completed but results error
  if (showResults && isResultsError) {
    return <ResultsErrorView resultsError={resultsError} refetchResults={refetchResults} />;
  }

  // Completed with results - check for components
  if (showResults && components.length === 0) {
    return <NoComponentsView projectUrl={projectUrl} refetchStatus={refetchStatus} />;
  }

  // Completed with components - show workspace
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
              </a>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              refetchStatus();
              refetchResults();
            }}
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
          {components.length > 0 ? (
            <ComponentTree
              components={components}
              selectedComponent={selectedComponent}
              onSelect={setSelectedComponent}
            />
          ) : (
            <div className="py-8 text-center text-xs text-muted-foreground">
              No components to display
            </div>
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
