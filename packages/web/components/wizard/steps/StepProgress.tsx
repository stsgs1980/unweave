"use client";

import React, { useEffect, useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useWizardStore } from "@/store/wizard-store";
import { Loader2, XCircle } from "lucide-react";
import { StageKey, StageRecord } from "@/lib/pipeline-stages";
import StageStepper from "@/components/wizard/steps/StageStepper";
import WorkerLogPanel from "@/components/wizard/steps/WorkerLogPanel";

/**
 * @file StepProgress component: live extraction stepper, job-scoped log panel,
 * completion timing summary, and cancellation.
 */

interface StatusPayload {
  status: string;
  progress: number;
  message?: string;
  error?: string;
  stages?: StageRecord[];
  result?: { timing?: Record<string, number> };
}

/**
 * Renders the extraction progress screen for the wizard.
 * @returns The rendered step content.
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
    extractionPhases,
    jobId,
    setJobId,
    setStep,
    reset: resetWizard,
  } = useWizardStore();

  const [progress, setProgress] = useState(10);
  const [message, setMessage] = useState("Initializing extraction worker...");
  const [isCancelling, setIsCancelling] = useState(false);
  const [stagesDone, setStagesDone] = useState<Set<StageKey>>(new Set());
  const [activeStage, setActiveStage] = useState<StageKey>("extract");
  const [stageTimes, setStageTimes] = useState<Partial<Record<StageKey, number>>>({});
  const [logLines, setLogLines] = useState<string[]>([]);
  const [showLog, setShowLog] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastStartedUrlRef = useRef<string | null>(null);
  const transitionedRef = useRef(false);

  const {
    mutate,
    reset,
    data: jobIdFromMutation,
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
            extractionPhases,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.jobId) throw new Error(data.error || "Failed to start extraction");
      return data.jobId as string;
    },
    onSuccess: (id) => setJobId(id),
    onError: (error: Error) => {
      toast.error(error.message);
      setStep(1);
    },
  });

  useEffect(() => {
    reset();
  }, [url, reset]);

  useEffect(() => {
    if (!url || lastStartedUrlRef.current === url) return;
    lastStartedUrlRef.current = url;
    mutate(url);
  }, [url, mutate]);

  const activeJobId = jobId ?? jobIdFromMutation;

  useEffect(() => {
    if (!activeJobId) return;
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const tick = async () => {
      try {
        const statusRes = await fetch(`/api/status/${activeJobId}`, { signal: controller.signal });
        if (!statusRes.ok) return;
        const s: StatusPayload = await statusRes.json();
        if (s.progress) setProgress(s.progress);
        if (s.message) setMessage(s.message);

        const doneStages = new Set<StageKey>();
        (s.stages ?? []).forEach((rec, i, arr) => {
          const nextAt = i + 1 < arr.length ? arr[i + 1].at : Date.now().toString();
          setStageTimes((prev) =>
            prev[rec.stage as StageKey] !== undefined
              ? prev
              : {
                  ...prev,
                  [rec.stage as StageKey]: Math.max(
                    new Date(nextAt).getTime() - new Date(rec.at).getTime(),
                    0,
                  ),
                },
          );
          if (i < arr.length - 1 || s.status !== "processing")
            doneStages.add(rec.stage as StageKey);
        });
        setStagesDone(doneStages);
        const lastRec = (s.stages ?? [])[(s.stages ?? []).length - 1];
        if (lastRec && s.status === "processing") setActiveStage(lastRec.stage);

        const logRes = await fetch(`/api/logs?jobId=${activeJobId}&limit=30`);
        if (logRes.ok) {
          const entries = await logRes.json();
          setLogLines(
            entries.map(
              (e: { timestamp: string; level: string; message: string }) =>
                `${e.timestamp.slice(11, 19)} ${e.level.toUpperCase()} ${e.message}`,
            ),
          );
        }

        if (s.status === "completed") {
          clearInterval(interval);
          controller.abort();
          const t = s.result?.timing;
          if (t) {
            setSummary(
              `Extract ${t.extract ?? 0}ms · Analyze ${t.analyze ?? 0}ms · Spec ${t.spec ?? 0}ms · Generate ${t.generate ?? 0}ms · Total ${t.total ?? 0}ms`,
            );
          }
          setStagesDone(new Set(["extract", "analyze", "spec", "generate"]));
          toast.success("Extraction completed successfully!");
          if (!transitionedRef.current) {
            transitionedRef.current = true;
            setTimeout(() => setStep("result"), 2000);
          }
        } else if (s.status === "failed") {
          clearInterval(interval);
          controller.abort();
          if (s.error !== "Cancelled by user") toast.error(s.error || "Extraction failed");
          setSummary(`Failed: ${s.error ?? "unknown error"}`);
        }
      } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") return;
      }
    };

    void tick();
    const interval = setInterval(tick, 1000);

    return () => {
      clearInterval(interval);
      abortControllerRef.current?.abort();
    };
  }, [activeJobId, setStep]);

  const handleCancel = async () => {
    if (!activeJobId) return;
    setIsCancelling(true);
    try {
      abortControllerRef.current?.abort();
      await fetch(`/api/status/${activeJobId}`, { method: "DELETE" });
      toast.info("Extraction cancelled");
      resetWizard();
      setStep(1);
    } catch {
      toast.error("Failed to cancel extraction");
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="space-y-5 py-6 text-center">
      <div className="flex justify-center">
        <div className="rounded-full bg-primary/10 p-3 text-primary">
          <Loader2 className="h-7 w-7 animate-spin" />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-foreground">Extracting UI &amp; Tokens</h3>
        <p className="mt-1 text-xs text-muted-foreground">{summary ?? message}</p>
      </div>

      <StageStepper
        stagesDone={stagesDone}
        activeStage={activeStage}
        stageTimes={stageTimes}
        hasFailed={Boolean(summary?.startsWith("Failed"))}
      />

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

      <WorkerLogPanel
        logLines={logLines}
        showLog={showLog}
        onToggle={() => setShowLog((v) => !v)}
      />

      <button
        type="button"
        onClick={handleCancel}
        disabled={isCancelling}
        className="mt-4 inline-flex items-center justify-center gap-1.5 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-2 text-xs font-medium text-destructive hover:bg-destructive/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <XCircle className="h-3.5 w-3.5" />
        {isCancelling ? "Cancelling..." : "Cancel Extraction"}
      </button>
    </div>
  );
}
