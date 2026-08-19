"use client";
import React, { useEffect, useState, useRef } from "react";
import { useWizardStore } from "@/store/wizard-store";

/**
 * Renders Step 3 of the extraction wizard: Progress tracking.
 * @returns {React.JSX.Element} The rendered step component.
 */
export default function StepProgress() {
  const { url, setJobId, setStep, reset } = useWizardStore();
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("Initializing...");

  // Хук, чтобы предотвратить двойной запуск в React Strict Mode
  const hasStarted = useRef(false);

  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;

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
          const interval = setInterval(async () => {
            const statusRes = await fetch(`/api/status/${data.jobId}`);
            const statusData = await statusRes.json();

            if (statusData.progress) setProgress(statusData.progress);
            if (statusData.result?.message) setMessage(statusData.result.message);

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
        <div
          className="h-2 rounded-full bg-primary transition-all duration-500"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <p className="text-sm text-muted-foreground">
        {message} ({progress}%)
      </p>
      {error && <p className="text-sm text-red-500">{error}</p>}
      {error && (
        <button onClick={reset} className="text-sm text-muted-foreground hover:underline">
          Close
        </button>
      )}
    </div>
  );
}
