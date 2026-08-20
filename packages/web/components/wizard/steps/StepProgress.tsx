"use client";
import React, { useEffect, useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useWizardStore } from "@/store/wizard-store";

export default function StepProgress() {
  const { url, setJobId, setStep } = useWizardStore();
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("Initializing...");
  const abortControllerRef = useRef<AbortController | null>(null);

  const mutation = useMutation({
    mutationFn: async (targetUrl: string) => {
      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: targetUrl }),
      });
      const data = await res.json();
      if (!res.ok || !data.jobId) {
        throw new Error(data.error || "Failed to start extraction");
      }
      return data.jobId;
    },
    onSuccess: (jobId) => {
      setJobId(jobId);
    },
    onError: (error: Error) => {
      toast.error(error.message);
      setStep("url");
    },
  });

  // Сброс мутации при смене URL — предотвращает stale data при возврате к шагу
  useEffect(() => {
    mutation.reset();
  }, [url, mutation]);

  // Запуск мутации при появлении URL (после reset или при первом монтировании)
  useEffect(() => {
    if (url) {
      mutation.mutate(url);
    }
  }, [mutation, url]);

  // Polling с AbortController — запускается только когда есть jobId
  useEffect(() => {
    if (!mutation.data) return;

    const jobId = mutation.data;
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
  }, [mutation.data]);

  return (
    <div className="space-y-4 text-center">
      <h2 className="text-lg font-semibold text-foreground">
        {mutation.isPending ? "Starting pipeline..." : "Extracting..."}
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
