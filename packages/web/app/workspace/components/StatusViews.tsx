"use client";

import React from "react";
import { AlertCircle, Loader2, Layers, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface JobStatus {
  id: string;
  status: "pending" | "processing" | "completed" | "failed";
  progress: number;
  message?: string;
  error?: string;
  url?: string;
}

interface StatusViewProps {
  jobStatus: JobStatus;
  refetchStatus?: () => void;
  projectUrl?: string;
}

/**
 * Renders the pending/processing status view with progress bar
 * @param root0
 * @param root0.jobStatus
 * @param root0.projectUrl
 */
export function ProcessingStatusView({ jobStatus, projectUrl }: StatusViewProps) {
  return (
    <main className="flex h-[calc(100vh-65px)] flex-col items-center justify-center p-8">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 mb-4">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <h1 className="text-lg font-semibold text-foreground">
            {jobStatus.status === "pending" ? "Starting Extraction..." : "Extracting Components"}
          </h1>
        </div>
        <p className="text-sm text-muted-foreground mb-4 text-center">
          {jobStatus.message || `Progress: ${jobStatus.progress}%`}
        </p>
        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${jobStatus.progress}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-muted-foreground text-center font-mono">
          {jobStatus.progress}%
        </p>
        {projectUrl && (
          <p className="mt-4 text-xs text-muted-foreground text-center truncate">
            Source: {projectUrl}
          </p>
        )}
      </div>
    </main>
  );
}

/**
 * Renders the failed status view with retry options
 * @param root0
 * @param root0.jobStatus
 * @param root0.refetchStatus
 * @param root0.projectUrl
 */
export function FailedStatusView({ jobStatus, refetchStatus, projectUrl }: StatusViewProps) {
  return (
    <main className="flex h-[calc(100vh-65px)] flex-col items-center justify-center p-8 text-center">
      <AlertCircle className="h-12 w-12 text-destructive mb-4" />
      <h1 className="text-xl font-bold text-foreground">Extraction Failed</h1>
      <p className="mt-2 text-sm text-muted-foreground max-w-md">
        {jobStatus.error || jobStatus.message || "An unknown error occurred during extraction."}
      </p>
      {projectUrl && (
        <p className="mt-2 text-xs text-muted-foreground truncate max-w-md">Source: {projectUrl}</p>
      )}
      <div className="mt-6 flex gap-3">
        <Button onClick={() => refetchStatus?.()} className="gap-2">
          <Layers className="h-4 w-4" />
          Try Again
        </Button>
        <a href="/">
          <Button variant="outline">New Extraction</Button>
        </a>
      </div>
    </main>
  );
}

/**
 * Renders the loading job status view
 */
export function StatusLoadingView() {
  return (
    <main className="flex h-[calc(100vh-65px)] flex-col items-center justify-center p-8">
      <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
      <p className="text-sm text-muted-foreground">Loading job status...</p>
    </main>
  );
}

/**
 * Renders the job status error view
 * @param root0
 * @param root0.refetchStatus
 */
export function StatusErrorView({ refetchStatus }: { refetchStatus: () => void }) {
  return (
    <main className="flex h-[calc(100vh-65px)] flex-col items-center justify-center p-8 text-center">
      <AlertCircle className="h-10 w-10 text-destructive mb-4" />
      <h1 className="text-xl font-bold text-foreground">Failed to Load Job Status</h1>
      <p className="mt-2 text-sm text-muted-foreground max-w-md">
        Could not retrieve the extraction job status. Please try again.
      </p>
      <div className="mt-6 flex gap-3">
        <Button onClick={refetchStatus} className="gap-2">
          <Loader2 className="h-4 w-4" />
          Retry
        </Button>
        <a href="/">
          <Button variant="outline">Go to Dashboard</Button>
        </a>
      </div>
    </main>
  );
}

/**
 * Renders the results loading view
 */
export function ResultsLoadingView() {
  return (
    <main className="flex h-[calc(100vh-65px)] flex-col items-center justify-center p-8">
      <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
      <p className="text-sm text-muted-foreground">Loading extraction results...</p>
    </main>
  );
}

/**
 * Renders the results error view
 * @param root0
 * @param root0.resultsError
 * @param root0.refetchResults
 */
export function ResultsErrorView({
  resultsError,
  refetchResults,
}: {
  resultsError?: Error;
  refetchResults: () => void;
}) {
  return (
    <main className="flex h-[calc(100vh-65px)] flex-col items-center justify-center p-8 text-center">
      <AlertCircle className="h-10 w-10 text-destructive mb-4" />
      <h1 className="text-xl font-bold text-foreground">Failed to Load Results</h1>
      <p className="mt-2 text-sm text-muted-foreground max-w-md">
        {resultsError?.message || "Could not load extraction results."}
      </p>
      <div className="mt-6 flex gap-3">
        <Button onClick={refetchResults} className="gap-2">
          <Loader2 className="h-4 w-4" />
          Retry
        </Button>
        <a href="/">
          <Button variant="outline">Go to Dashboard</Button>
        </a>
      </div>
    </main>
  );
}

/**
 * Renders the no components found view
 * @param root0
 * @param root0.projectUrl
 * @param root0.refetchStatus
 */
export function NoComponentsView({
  projectUrl,
  refetchStatus,
}: {
  projectUrl?: string;
  refetchStatus: () => void;
}) {
  return (
    <main className="flex h-[calc(100vh-65px)] flex-col items-center justify-center p-8 text-center">
      <Layers className="h-12 w-12 text-muted-foreground/50 mb-4" />
      <h1 className="text-xl font-bold text-foreground">No Components Found</h1>
      <p className="mt-2 text-sm text-muted-foreground max-w-md">
        The extraction completed but no UI components were detected. This can happen if the page is
        empty, uses heavy JavaScript rendering, or has restrictive CSP.
      </p>
      {projectUrl && (
        <p className="mt-2 text-xs text-muted-foreground truncate max-w-md">Source: {projectUrl}</p>
      )}
      <div className="mt-6 flex gap-3">
        <Button onClick={refetchStatus} className="gap-2">
          <Loader2 className="h-4 w-4" />
          Re-extract
        </Button>
        <a href="/">
          <Button variant="outline">New Extraction</Button>
        </a>
      </div>
    </main>
  );
}

/**
 * Renders the no extraction selected view
 */
export function NoExtractionSelectedView() {
  return (
    <main className="flex h-[calc(100vh-65px)] flex-col items-center justify-center p-8 text-center">
      <Layers className="h-8 w-8 text-muted-foreground mb-4" />
      <h1 className="text-xl font-bold text-foreground">No Extraction Selected</h1>
      <p className="mt-2 text-sm text-muted-foreground max-w-md">
        Run a new website extraction on the Dashboard to inspect components and design tokens in
        Workspace.
      </p>
      <div className="mt-6">
        <a href="/">
          <Button className="gap-2">
            <Loader2 className="h-4 w-4" />
            Go to Dashboard
          </Button>
        </a>
      </div>
    </main>
  );
}
