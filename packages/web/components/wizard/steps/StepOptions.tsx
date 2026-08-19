"use client";
import React from "react";
import { useWizardStore } from "@/store/wizard-store";

/**
 * Renders Step 2 of the extraction wizard: Options.
 * @returns {React.JSX.Element} The rendered step component.
 */
export default function StepOptions() {
  const { setStep, reset } = useWizardStore();

  const handleStart = async () => {
    setStep("progress");
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-foreground">Step 2: Options</h2>
      <div className="space-y-2 text-sm text-muted-foreground">
        <p>[TODO] Add checkboxes for extraction options here.</p>
        <p>Extract React Components: Yes</p>
        <p>Extract Design Tokens: Yes</p>
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
