"use client";

import React from "react";

export interface LogEntry {
  timestamp: string;
  level: "info" | "warn" | "error" | "debug";
  module: string;
  message: string;
  data?: any;
}

/**
 * Returns the Tailwind CSS classes for a log level.
 * @param level - The log level
 * @returns Tailwind CSS class string for the level badge.
 */
function getLevelColor(level: string): string {
  switch (level) {
    case "error":
      return "bg-destructive/10 text-destructive border-destructive/20";
    case "warn":
      return "bg-amber-500/10 text-amber-500 border-amber-500/20";
    case "info":
      return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}

/**
 * Formats a timestamp string to HH:MM:SS.mmm format.
 * @param timestamp - ISO timestamp string
 * @returns Formatted time string (HH:MM:SS.mmm)
 */
function formatTime(timestamp: string): string {
  const date = new Date(timestamp);
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const seconds = date.getSeconds().toString().padStart(2, "0");
  const ms = date.getMilliseconds().toString().padStart(3, "0");
  return `${hours}:${minutes}:${seconds}.${ms}`;
}

interface LogEntryRowProps {
  log: LogEntry;
}

/**
 * Renders a single log entry row.
 * @param props - Component props
 * @param props.log - The log entry to display
 * @returns The rendered log entry row.
 */
export function LogEntryRow({ log }: LogEntryRowProps) {
  return (
    <tr className="hover:bg-muted/40 transition-colors">
      <td className="px-4 py-2 text-muted-foreground whitespace-nowrap text-[11px]">
        {formatTime(log.timestamp)}
      </td>
      <td className="px-4 py-2 whitespace-nowrap">
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider border ${getLevelColor(
            log.level,
          )}`}
        >
          {log.level}
        </span>
      </td>
      <td className="px-4 py-2 font-semibold text-foreground/80 whitespace-nowrap text-[11px]">
        [{log.module}]
      </td>
      <td className="px-4 py-2 text-foreground font-sans text-xs">{log.message}</td>
      <td className="px-4 py-2 text-muted-foreground text-[11px] max-w-xs truncate">
        {log.data ? JSON.stringify(log.data) : "-"}
      </td>
    </tr>
  );
}
