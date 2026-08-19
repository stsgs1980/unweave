"use client";
import React, { useEffect, useState } from "react";
import { useWizardStore } from "@/store/wizard-store";

/**
 *
 */
export default function StepProgress() {
  const { url, setJobId, setStep, reset } = useWizardStore();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const startExtraction = async () => {
      try {
        const res = await fetch("/api/extract", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
        });
        const data = await res.json();
        if (data.jobId) {
          setJobId(data.jobId);
          // Polling
          const interval = setInterval(async () => {
            const statusRes = await fetch(`/api/status/${data.jobId}`);
            const statusData = await statusRes.json();
            if (statusData.status === "completed") {
              clearInterval(interval);
              setStep("result");
            } else if (statusData.status === "failed") {
              clearInterval(interval);
              setError(statusData.error || "Extraction failed");
            }
          }, 1000);
        }
      } catch (err) {
        setError("Failed to start job");
      }
    };
    startExtraction();
  }, [url, setJobId, setStep]);

  return (
    <div className="space-y-4 text-center">
      <h2 className="text-lg font-semibold text-foreground">Extracting...</h2>
      <div className="h-2 w-full rounded-full bg-muted">
        <div className="h-2 rounded-full bg-primary transition-all" style={{ width: "50%" }}></div>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      {error && (
        <button onClick={reset} className="text-sm text-muted-foreground hover:underline">
          Close
        </button>
      )}
    </div>
  );
}
