"use client";

/**
 * @file LivePipelineWidget component for displaying real-time extraction status.
 */

import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { XCircle } from "lucide-react";
import type { Job } from "@/lib/jobStore";

/**
 * Renders a live indicator of active extraction pipelines using SSE.
 * @returns The rendered live pipeline widget.
 */
export default function LivePipelineWidget() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [cancellingIds, setCancellingIds] = useState<Set<string>>(new Set());

  const handleStop = async (jobId: string) => {
    setCancellingIds((prev) => new Set(prev).add(jobId));
    try {
      const res = await fetch(`/api/status/${jobId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to stop");
      toast.info("Extraction stopped");
    } catch {
      toast.error("Failed to stop extraction");
    } finally {
      setCancellingIds((prev) => {
        const next = new Set(prev);
        next.delete(jobId);
        return next;
      });
    }
  };

  useEffect(() => {
    // Subscribe to SSE endpoint
    const eventSource = new EventSource("/api/events");

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "initial") {
        setJobs(data.jobs);
      } else if (data.type === "update") {
        setJobs((prevJobs) => {
          const exists = prevJobs.find((j) => j.id === data.job.id);
          if (exists) {
            // Update existing
            return prevJobs.map((j) => (j.id === data.job.id ? data.job : j));
          }
          // Add new if active
          if (data.job.status === "pending" || data.job.status === "processing") {
            return [...prevJobs, data.job];
          }
          return prevJobs;
        });
      }
    };

    return () => {
      eventSource.close();
    };
  }, []);

  // Filter only active jobs for display
  const activeJobs = jobs.filter((j) => j.status === "pending" || j.status === "processing");

  if (activeJobs.length === 0) {
    return null; // Don't show widget if no active jobs
  }

  const widgetClass = "rounded-lg border border-border bg-card p-4 text-card-foreground space-y-4";

  return (
    <div className={widgetClass}>
      <h2 className="text-lg font-semibold text-foreground">Live Pipeline</h2>
      <div className="space-y-4">
        {activeJobs.map((job) => (
          <div key={job.id} className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="truncate text-muted-foreground">{job.url || job.id}</span>
              <span className="text-muted-foreground">{job.progress}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-muted">
              <div
                className="h-1.5 rounded-full bg-primary transition-all duration-500"
                style={{ width: `${job.progress}%` }}
              ></div>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">{job.message || "Initializing..."}</p>
              <button
                type="button"
                onClick={() => handleStop(job.id)}
                disabled={cancellingIds.has(job.id)}
                className="inline-flex items-center gap-1 rounded-md border border-destructive/50 bg-destructive/10 px-2 py-1 text-[10px] font-medium text-destructive hover:bg-destructive/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <XCircle className="h-3 w-3" />
                {cancellingIds.has(job.id) ? "Stopping..." : "Stop"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
