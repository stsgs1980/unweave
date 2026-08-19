"use client";

/**
 * @file LivePipelineWidget component for displaying real-time extraction status.
 */

import React, { useEffect, useState } from "react";
import type { Job } from "@/lib/jobStore";

/**
 * Renders a live indicator of active extraction pipelines using SSE.
 * @returns The rendered live pipeline widget.
 */
export default function LivePipelineWidget() {
  const [jobs, setJobs] = useState<Job[]>([]);

  useEffect(() => {
    // Подписываемся на SSE эндпоинт
    const eventSource = new EventSource("/api/events");

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "initial") {
        setJobs(data.jobs);
      } else if (data.type === "update") {
        setJobs((prevJobs) => {
          const exists = prevJobs.find((j) => j.id === data.job.id);
          if (exists) {
            // Обновляем существующую
            return prevJobs.map((j) => (j.id === data.job.id ? data.job : j));
          }
          // Добавляем новую, если она активна
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

  // Фильтруем только активные задачи для отображения
  const activeJobs = jobs.filter((j) => j.status === "pending" || j.status === "processing");

  if (activeJobs.length === 0) {
    return null; // Не показываем виджет, если нет активных задач
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
            <p className="text-xs text-muted-foreground">{job.message || "Initializing..."}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
