"use client";
import React from "react";
import { useWizardStore } from "@/store/wizard-store";
import { useUIStore } from "@/store/ui-store";

/**
 *
 */
export default function ExtractInput() {
  const setWizardOpen = useUIStore((state) => state.setWizardOpen);
  const resetWizard = useWizardStore((state) => state.reset);

  const handleClick = () => {
    resetWizard();
    setWizardOpen(true);
  };

  const buttonClass = [
    "rounded-md bg-primary px-6 py-2 font-medium text-primary-foreground",
    "transition-colors hover:bg-primary/90",
  ].join(" ");

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-8">
      <h2 className="text-xl font-semibold text-foreground">Start New Extraction</h2>
      <button onClick={handleClick} className={buttonClass}>
        Open Extract Wizard
      </button>
    </div>
  );
}
