"use client";

import React from "react";
import { useWizardStore } from "@/store/wizard-store";
import { Zap, CheckCircle2 } from "lucide-react";

/**
 * Step 4: Summary card and extraction launch trigger.
 */
export default function Step4Summary() {
  const {
    url,
    viewport,
    componentFocus,
    screenshots,
    format,
    extraOptions,
    selectedElements,
    extractionPhases,
    setStep,
  } = useWizardStore();

  const handleLaunch = () => {
    // Store extractionPhases in the wizard store for the worker to pick up
    useWizardStore.getState().setExtractionPhases(extractionPhases);
    setStep("progress");
  };

  const handleBack = () => {
    setStep(3);
  };

  const activeScreenshots = Object.entries(screenshots)
    .filter(([_, active]) => active)
    .map(([key]) => key);

  const activeExtras = Object.entries(extraOptions)
    .filter(([_, active]) => active)
    .map(([key]) => key);

  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-border bg-card p-4 space-y-3">
        <div className="flex items-center gap-2 border-b border-border pb-2.5">
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">
            Job Configuration
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-2.5 text-xs sm:grid-cols-2">
          <div>
            <span className="text-muted-foreground">Source (URL):</span>
            <p className="truncate font-semibold text-foreground">{url}</p>
          </div>

          <div>
            <span className="text-muted-foreground">Resolution:</span>
            <p className="font-semibold capitalize text-foreground">{viewport}</p>
          </div>

          <div>
            <span className="text-muted-foreground">Components Selected:</span>
            <p className="font-semibold text-foreground">{selectedElements.length} manual + auto</p>
          </div>

          <div>
            <span className="text-muted-foreground">Code Format:</span>
            <p className="font-semibold uppercase text-primary">{format}</p>
          </div>

          <div>
            <span className="text-muted-foreground">Screenshots:</span>
            <p className="text-foreground">
              {activeScreenshots.length > 0 ? activeScreenshots.join(", ") : "Disabled"}
            </p>
          </div>

          <div>
            <span className="text-muted-foreground">Generation Options:</span>
            <p className="text-foreground">
              {activeExtras.length > 0 ? activeExtras.join(", ") : "Standard"}
            </p>
          </div>
        </div>

        {componentFocus && (
          <div className="border-t border-border pt-2 text-xs">
            <span className="text-muted-foreground">Focus Types:</span>
            <p className="font-mono text-muted-foreground/90">{componentFocus}</p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-1">
        <button
          type="button"
          onClick={handleBack}
          className="rounded-lg border border-border px-4 py-2 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          ← Back
        </button>
        <button
          type="button"
          onClick={handleLaunch}
          className="flex items-center gap-1.5 rounded-lg bg-primary px-6 py-2 text-xs font-semibold text-primary-foreground shadow transition-colors hover:bg-primary/90"
        >
          <Zap className="h-4 w-4" />
          Launch Extraction
        </button>
      </div>
    </div>
  );
}
