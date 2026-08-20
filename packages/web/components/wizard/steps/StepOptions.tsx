"use client";
import React from "react";
import { useWizardStore } from "@/store/wizard-store";

/**
 * Renders Step 2 of the extraction wizard: Options.
 * @returns {React.JSX.Element} The rendered step component.
 */
export default function StepOptions() {
  const { setStep, reset, options, setOptions } = useWizardStore();

  const handleStart = () => {
    setStep("progress");
  };

  const labelClass = "flex items-center gap-2 cursor-pointer text-sm text-muted-foreground";

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-foreground">Step 2: Extraction Options</h2>

      <div className="space-y-4">
        <label className={labelClass}>
          <input
            type="checkbox"
            checked={options.blockMedia}
            onChange={(e) => setOptions({ blockMedia: e.target.checked })}
            className="h-4 w-4 rounded border-border"
          />
          Fast Mode (Block images/fonts/video)
        </label>

        <label className={labelClass}>
          <input
            type="checkbox"
            checked={options.screenshot}
            onChange={(e) => setOptions({ screenshot: e.target.checked })}
            className="h-4 w-4 rounded border-border"
          />
          Capture Screenshots (Full page, Viewport, Mobile)
        </label>
      </div>

      <div className="flex justify-between">
        <button onClick={reset} className="text-sm text-muted-foreground hover:underline">
          Cancel
        </button>
        <button
          onClick={handleStart}
          className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
        >
          Start Extraction
        </button>
      </div>
    </div>
  );
}
