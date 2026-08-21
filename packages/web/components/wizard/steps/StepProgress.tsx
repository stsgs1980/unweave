"use client";

import React, { useEffect, useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useWizardStore } from "@/store/wizard-store";
import { Loader2 } from "lucide-react";

/**
 * StepProgress component for the extraction wizard.
 * Handles pipeline mutation lifecycle, polling, and animated progress display.
 */
export default function StepProgress() {
  const {
    url,
    viewport,
    componentFocus,
    screenshots,
    format,
    extraOptions,
    selectedElements,
    setJobId,
    setStep,
  } = useWizardStore();

  const [progress, setProgress] = useState(10);
  const [message, setMessage] = useState("Initializing extraction worker...");
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
        body: JSON.stringify({
          url: targetUrl,
          options: {
            viewport,
            componentFocus,
            screenshots,
            format,
            extraOptions,
            selectedElements,
          },
        }),
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
      setStep(1);
    },
  });

  useEffect(() => {
    reset();
  }, [url, reset]);

  useEffect(() => {
    if (url) {
      mutate(url);
    }
  }, [url, mutate]);

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
        if (statusData.message) setMessage(statusData.message);
        else if (statusData.result?.message) setMessage(statusData.result.message);

        if (statusData.status === "completed") {
          clearInterval(interval);
          toast.success("Extraction completed successfully!");
          setStep("result");
        } else if (statusData.status === "failed") {
          clearInterval(interval);
          toast.error(statusData.error || "Extraction failed");
          setStep(1);
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

  return (
    <div className="space-y-5 py-6 text-center">
      <div className="flex justify-center">
        <div className="rounded-full bg-primary/10 p-3 text-primary">
          <Loader2 className="h-7 w-7 animate-spin" />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-foreground">
          {isPending ? "Starting background worker..." : "Extracting UI & Tokens"}
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">{message}</p>
      </div>

      <div className="space-y-1.5">
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
          <span>{url}</span>
          <span>{progress}%</span>
        </div>
      </div>
    </div>
  );
}
