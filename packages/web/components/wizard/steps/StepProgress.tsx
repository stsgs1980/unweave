"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { useWizardStore } from "@/store/wizard-store";
import { Loader2, XCircle } from "lucide-react";
import StageStepper from "@/components/wizard/steps/StageStepper";
import WorkerLogPanel from "@/components/wizard/steps/WorkerLogPanel";
import { useExtractMutation } from "@/components/wizard/steps/useExtractMutation";
import { useExtractionPolling } from "@/components/wizard/steps/useExtractionPolling";

/**
 * @file StepProgress component: live extraction stepper, job-scoped log panel,
 * completion timing summary, and cancellation.
 */

/**
 * Renders the extraction progress screen for the wizard.
 * @returns The rendered step content.
 */
export default function StepProgress() {
  const { url, jobId, setStep, reset: resetWizard } = useWizardStore();
  const [isCancelling, setIsCancelling] = useState(false);
  const [showLog, setShowLog] = useState(false);

  const jobIdFromMutation = useExtractMutation();
  const activeJobId = jobId ?? jobIdFromMutation;

  const {
    progress,
    message,
    stagesDone,
    activeStage,
    stageTimes,
    logLines,
    summary,
    terminal,
    abortControllerRef,
    cancelledJobsRef,
  } = useExtractionPolling(activeJobId ?? null, () => setStep("result"));

  const hasFailed = terminal === "failed" || terminal === "disconnected";

  const handleCancel = async () => {
    if (!activeJobId) return;
    setIsCancelling(true);
    try {
      const cancelRes = await fetch(`/api/status/${activeJobId}`, { method: "DELETE" });
      if (!cancelRes.ok) {
        throw new Error(`Cancel request failed (HTTP ${cancelRes.status})`);
      }
      cancelledJobsRef.current.add(activeJobId);
      abortControllerRef.current?.abort();
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
        <div
          className={`rounded-full p-3 ${
            hasFailed ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"
          }`}
        >
          {hasFailed ? (
            <XCircle className="h-7 w-7" />
          ) : (
            <Loader2 className="h-7 w-7 animate-spin" />
          )}
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
        hasFailed={hasFailed}
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

      {(terminal === null || terminal === "disconnected") && (
        <button
          type="button"
          onClick={handleCancel}
          disabled={isCancelling}
          className="mt-4 inline-flex items-center justify-center gap-1.5 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-2 text-xs font-medium text-destructive hover:bg-destructive/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <XCircle className="h-3.5 w-3.5" />
          {isCancelling ? "Cancelling..." : "Cancel Extraction"}
        </button>
      )}
    </div>
  );
}
