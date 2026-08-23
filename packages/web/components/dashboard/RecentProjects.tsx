/**
 * @file RecentProjects component for displaying a grid of recent extractions,
 * grouped by site with expandable run history.
 */

import React, { useState } from "react";
import Link from "next/link";
import { ExternalLink, CheckCircle2, Clock, AlertCircle, Loader2, ChevronDown } from "lucide-react";
import { groupProjects, ProjectGroup } from "@/components/dashboard/project-grouping";

/**
 * Represents a recently extracted project.
 */
export interface Project {
  id: string;
  name: string;
  url: string;
  date: string;
  status: "completed" | "processing" | "failed" | "pending" | string;
  progress?: number;
  message?: string;
  error?: string;
  componentCount?: number;
  tokenCount?: number;
}

/**
 * Props for the RecentProjects component.
 */
interface RecentProjectsProps {
  projects: Project[];
}

/**
 * Formats an ISO date string as a short localized date and time.
 * @param {string} dateStr - The ISO date string.
 * @returns The formatted date, or the raw string when parsing fails.
 */
function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

/**
 * Builds the status badge element for a project card.
 * @param {string} status - The job status.
 * @param {number | undefined} progress - The current progress for processing jobs.
 * @returns The rendered badge.
 */
function getStatusBadge(status: string, progress?: number) {
  const norm = status.toLowerCase();
  switch (norm) {
    case "completed":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-500">
          <CheckCircle2 className="h-3 w-3" />
          Completed
        </span>
      );
    case "processing":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/20 bg-blue-500/10 px-2.5 py-0.5 text-xs font-medium text-blue-500">
          <Loader2 className="h-3 w-3 animate-spin" />
          {progress !== undefined ? `${progress}%` : "Processing"}
        </span>
      );
    case "failed":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-destructive/20 bg-destructive/10 px-2.5 py-0.5 text-xs font-medium text-destructive">
          <AlertCircle className="h-3 w-3" />
          Failed
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
          <Clock className="h-3 w-3" />
          {status}
        </span>
      );
  }
}

/**
 * Renders a compact history row for a single past run.
 * @param {Project} project - The earlier run.
 * @returns The rendered row.
 */
function EarlierRunRow({ project }: { project: Project }) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-md bg-muted/40 px-2.5 py-1.5 text-xs">
      <span className="text-muted-foreground">{formatDate(project.date)}</span>
      <span
        className={
          project.status.toLowerCase() === "completed"
            ? "text-emerald-500"
            : project.status.toLowerCase() === "failed"
              ? "text-destructive"
              : "text-blue-500"
        }
      >
        {project.status}
      </span>
      <Link
        href={`/workspace?jobId=${project.id}`}
        className="font-medium text-primary hover:underline"
      >
        Open →
      </Link>
    </div>
  );
}

/**
 * Renders a grid of recent project cards grouped by site.
 * @param {RecentProjectsProps} props - The component props.
 * @returns The rendered projects grid.
 */
export default function RecentProjects({ projects }: RecentProjectsProps) {
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());

  if (projects.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center rounded-lg border border-border p-12 text-center">
        <p className="text-sm font-medium text-foreground">No recent projects found</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Enter a URL above to start extracting UI components and design tokens.
        </p>
      </div>
    );
  }

  const groups: ProjectGroup[] = groupProjects(projects);

  const toggleExpanded = (key: string) => {
    setExpandedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {groups.map((group) => {
        const project = group.latest;
        const earlierRuns = group.runs.slice(1);
        const isExpanded = expandedKeys.has(project.url);
        return (
          <div
            key={project.id}
            className="group relative flex flex-col justify-between rounded-lg border border-border bg-card p-5 text-card-foreground transition-all hover:border-primary/40 hover:shadow-sm"
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <Link
                  href={`/workspace?jobId=${project.id}`}
                  className="font-semibold text-foreground transition-colors hover:text-primary"
                >
                  {project.name}
                </Link>
                {getStatusBadge(project.status, project.progress)}
              </div>

              <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                <a
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:text-foreground hover:underline"
                >
                  <span className="max-w-[220px] truncate">{project.url}</span>
                  <ExternalLink className="h-3 w-3 shrink-0" />
                </a>
              </div>

              {project.error && (
                <p className="mt-2 text-xs text-destructive truncate" title={project.error}>
                  {project.error}
                </p>
              )}

              {project.status.toLowerCase() === "completed" && (
                <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                  <span>{project.componentCount || 0} components</span>
                  <span>•</span>
                  <span>{project.tokenCount || 0} tokens</span>
                </div>
              )}
            </div>

            {earlierRuns.length > 0 && (
              <div className="mt-3">
                <button
                  type="button"
                  onClick={() => toggleExpanded(project.url)}
                  className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
                >
                  <ChevronDown
                    className={`h-3 w-3 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                  />
                  {earlierRuns.length} earlier run{earlierRuns.length > 1 ? "s" : ""}
                </button>
                {isExpanded && (
                  <div className="mt-2 space-y-1.5">
                    {earlierRuns.map((run) => (
                      <EarlierRunRow key={run.id} project={run} />
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3 text-xs text-muted-foreground">
              <span>{formatDate(project.date)}</span>
              <Link
                href={`/workspace?jobId=${project.id}`}
                className="font-medium text-primary hover:underline"
              >
                Open Studio →
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}
