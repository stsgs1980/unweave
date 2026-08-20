"use client";
import React, { useEffect, useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useWizardStore } from "@/store/wizard-store";

/**
 * StepProgress component for the extraction wizard.
 * Handles mutation lifecycle, polling, and progress display.
 * @returns {React.JSX.Element} The step progress UI.
 */
export default function StepProgress() {
  const { url, setJobId, setStep, options } = useWizardStore();
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("Initializing...");
  const abortControllerRef = useRef<AbortController | null>(null);

  const {
    mutate,
    reset,
    isPending,
    data: jobId,
  } = useMutation({
    mutationFn: async (targetUrl: string) => {
      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: targetUrl, options }),
      });
      const data = await res.json();
      if (!res.ok || !data.jobId) {
        throw new Error(data.error || "Failed to start extraction");
      }
      return data.jobId;
    },
    onSuccess: (id) => {
      setJobId(id);
    },
    onError: (error: Error) => {
      toast.error(error.message);
      setStep("url");
    },
  });

  // [1] ЯВНЫЙ сброс ПЕРЕД новым запуском при смене URL.
  // `reset` стабильна, поэтому эффект вызовется ТОЛЬКО при смене `url`.
  useEffect(() => {
    reset();
  }, [url, reset]);

  // [2] Запуск ПОСЛЕ сброса — гарантирует чистое состояние.
  // `mutate` стабильна, поэтому эффект вызовется ТОЛЬКО при смене `url`.
  useEffect(() => {
    if (url) {
      mutate(url);
    }
  }, [url, mutate]);

  // [3] Polling — только когда есть НОВЫЙ jobId
  useEffect(() => {
    if (!jobId) return;

    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    const interval = setInterval(async () => {
      try {
        const statusRes = await fetch(`/api/status/${jobId}`, { signal });
        if (!statusRes.ok) return;
        const statusData = await statusRes.json();

        if (statusData.progress) setProgress(statusData.progress);
        if (statusData.result?.message) setMessage(statusData.result.message);

        if (statusData.status === "completed") {
          clearInterval(interval);
          toast.success("Extraction completed successfully!");
          setStep("result");
        } else if (statusData.status === "failed") {
          clearInterval(interval);
          toast.error(statusData.error || "Extraction failed");
          setStep("url");
        }
      } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") return;
      }
    }, 1000);

    return () => {
      clearInterval(interval);
      abortControllerRef.current?.abort();
    };
  }, [jobId, setStep]);

  // UI
  return (
    <div className="space-y-4 text-center">
      <h2 className="text-lg font-semibold text-foreground">
        {isPending ? "Starting pipeline..." : "Extracting..."}
      </h2>
      <div className="h-2 w-full rounded-full bg-muted">
        <div
          className="h-2 rounded-full bg-primary transition-all duration-500"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <p className="text-sm text-muted-foreground">
        {message} ({progress}%)
      </p>
    </div>
  );
}
