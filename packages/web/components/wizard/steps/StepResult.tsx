"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useWizardStore } from "@/store/wizard-store";
import { CheckCircle2, Layers, Palette, RefreshCw } from "lucide-react";

const SCREENSHOT_LABELS: Record<string, string> = {
  full: "Full page",
  viewport: "Viewport",
  mobile: "Mobile",
};

/**
 * StepResult: Shows completion message with screenshots and deep-links to Workspace Studio and Tokens View.
 * @returns The rendered result step content.
 */
export default function StepResult() {
  const { reset, jobId, close } = useWizardStore();
  const [screenshots, setScreenshots] = useState<string[]>([]);

  useEffect(() => {
    if (!jobId) return;
    let cancelled = false;
    fetch(`/api/screenshots/${jobId}`)
      .then((res) => (res.ok ? res.json() : []))
      .then((names: string[]) => {
        if (!cancelled) setScreenshots(names);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [jobId]);

  const handleNewExtraction = () => {
    reset();
  };

  return (
    <div className="space-y-6 py-4 text-center">
      <div className="flex justify-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
          <CheckCircle2 className="h-8 w-8" />
        </div>
      </div>

      <div>
        <h3 className="text-base font-bold text-foreground">Extraction Complete!</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Components and design tokens saved to database and ready for inspection.
        </p>
      </div>

      {screenshots.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">Captured screenshots</p>
          <div className="flex flex-wrap items-start justify-center gap-3">
            {screenshots.map((name) => (
              <a
                key={name}
                href={`/api/screenshots/${jobId}/${name}.png`}
                target="_blank"
                rel="noreferrer"
                className="group block w-40"
                title={`Open ${SCREENSHOT_LABELS[name] ?? name} screenshot`}
              >
                <img
                  src={`/api/screenshots/${jobId}/${name}.png`}
                  alt={`${SCREENSHOT_LABELS[name] ?? name} screenshot`}
                  className="h-24 w-40 rounded-lg border border-border object-cover object-top transition-opacity group-hover:opacity-80"
                />
                <span className="mt-1 block text-[10px] text-muted-foreground group-hover:text-foreground">
                  {SCREENSHOT_LABELS[name] ?? name}
                </span>
              </a>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
        <Link
          href={`/workspace?jobId=${jobId}`}
          onClick={close}
          className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground shadow transition-colors hover:bg-primary/90"
        >
          <Layers className="h-4 w-4" />
          Open Workspace
        </Link>
        <Link
          href={`/tokens?jobId=${jobId}`}
          onClick={close}
          className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-xs font-medium text-foreground hover:bg-accent transition-colors"
        >
          <Palette className="h-4 w-4 text-primary" />
          View Tokens
        </Link>
      </div>

      <div className="border-t border-border pt-4">
        <button
          onClick={handleNewExtraction}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground hover:underline"
        >
          <RefreshCw className="h-3 w-3" />
          Start New Extraction
        </button>
      </div>
    </div>
  );
}
