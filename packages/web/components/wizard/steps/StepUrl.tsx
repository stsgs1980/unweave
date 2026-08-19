"use client";
import React from "react";
import { useWizardStore } from "@/store/wizard-store";

/**
 * Renders Step 1 of the extraction wizard: URL input.
 * @returns {React.JSX.Element} The rendered step component.
 */
export default function StepUrl() {
  const { url, setUrl, setStep } = useWizardStore();

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) setStep("options");
  };

  const inputClass = [
    "flex-1 rounded-md border border-border bg-background px-4 py-2",
    "placeholder:text-muted-foreground focus:ring-2 focus:ring-ring",
  ].join(" ");

  return (
    <form onSubmit={handleNext} className="space-y-4">
      <h2 className="text-lg font-semibold text-foreground">Step 1: Enter URL</h2>
      <input
        type="url"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https://example.com"
        className={inputClass}
        required
        autoFocus
      />
      <div className="flex justify-end">
        <button
          type="submit"
          className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
        >
          Next
        </button>
      </div>
    </form>
  );
}
