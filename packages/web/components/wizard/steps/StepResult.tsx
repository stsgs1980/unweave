"use client";

import React from "react";
import { useWizardStore } from "@/store/wizard-store";

/**
 * Renders the final step of the extraction wizard: Results.
 * @returns {React.JSX.Element} The rendered step component.
 */
export default function StepResult() {
  const { reset, jobId } = useWizardStore();

  const buttonClass = "rounded-md px-4 py-2 text-primary-foreground";

  return (
    <div className="space-y-4 text-center">
      <h2 className="text-lg font-semibold text-foreground">[OK] Success!</h2>
      <p className="text-sm text-muted-foreground">Components extracted successfully.</p>
      <div className="flex justify-center gap-4">
        <button
          onClick={reset}
          className="rounded-md border border-border px-4 py-2 hover:bg-accent"
        >
          New Extraction
        </button>
        <a
          href={`/workspace?jobId=${jobId}`}
          className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
        >
          View Workspace
        </a>
        <a
          href={`/tokens?jobId=${jobId}`}
          className="rounded-md bg-secondary px-4 py-2 text-secondary-foreground hover:bg-secondary/90"
        >
          View Tokens
        </a>
      </div>
    </div>
  );
}
