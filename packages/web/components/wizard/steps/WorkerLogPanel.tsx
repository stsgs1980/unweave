"use client";

import { ChevronDown, ChevronUp } from "lucide-react";

interface WorkerLogPanelProps {
  logLines: string[];
  showLog: boolean;
  onToggle: () => void;
}

/**
 * Renders the collapsible job-scoped worker log panel.
 * @param {WorkerLogPanelProps} props - Log lines and visibility state.
 * @returns The rendered log toggle and console panel.
 */
export default function WorkerLogPanel({ logLines, showLog, onToggle }: WorkerLogPanelProps) {
  return (
    <>
      <button
        type="button"
        onClick={onToggle}
        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
      >
        {showLog ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        Worker Log {logLines.length > 0 && `(${logLines.length})`}
      </button>
      <div
        className={
          showLog
            ? "mx-auto max-w-md max-h-48 overflow-y-auto rounded-lg bg-zinc-950 p-3 text-left font-mono text-[11px] leading-relaxed text-zinc-300"
            : "hidden"
        }
      >
        {logLines.length === 0 && <div className="text-zinc-500">No log entries yet...</div>}
        {logLines.map((line, i) => (
          <div key={i}>{line}</div>
        ))}
      </div>
    </>
  );
}
