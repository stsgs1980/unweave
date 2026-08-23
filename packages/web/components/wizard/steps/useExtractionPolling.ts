"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { StageKey, StageRecord } from "@/lib/pipeline-stages";

/**
 * @file useExtractionPolling hook: polls job status and logs, tracks stage
 * progress and timings, and reports terminal states.
 */

export type TerminalState = "completed" | "failed" | "disconnected";

const POLL_INTERVAL_MS = 1000;
const MAX_CONSECUTIVE_ERRORS = 5;
const COMPLETION_DELAY_MS = 2000;
const CANCELLED_BY_USER = "Cancelled by user";

const ALL_STAGES: readonly StageKey[] = ["extract", "analyze", "spec", "generate"];

/**
 * Type guard that validates a raw stage string against known pipeline stages.
 * @param {string} value - The stage identifier from the status payload.
 * @returns True when the value is a valid StageKey.
 */
function isStageKey(value: string): value is StageKey {
  return (ALL_STAGES as readonly string[]).includes(value);
}

interface StatusPayload {
  status: string;
  progress: number;
  message?: string;
  error?: string;
  stages?: StageRecord[];
  result?: { timing?: Record<string, number> };
}

/**
 * Polls extraction job status and worker logs for the given jobId.
 * @param {string | null} jobId - The active extraction job id.
 * @param {() => void} onCompleted - Invoked after the completion delay once the job succeeds.
 * @returns Polling state, terminal state, and cancellation handles.
 */
export function useExtractionPolling(jobId: string | null, onCompleted: () => void) {
  const [progress, setProgress] = useState(10);
  const [message, setMessage] = useState("Initializing extraction worker...");
  const [stagesDone, setStagesDone] = useState<Set<StageKey>>(new Set());
  const [activeStage, setActiveStage] = useState<StageKey>("extract");
  const [stageTimes, setStageTimes] = useState<Partial<Record<StageKey, number>>>({});
  const [logLines, setLogLines] = useState<string[]>([]);
  const [summary, setSummary] = useState<string | null>(null);
  const [terminal, setTerminal] = useState<TerminalState | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const transitionedRef = useRef(false);
  const transitionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const consecutiveErrorsRef = useRef(0);
  const cancelledJobsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!jobId || cancelledJobsRef.current.has(jobId)) return;
    const controller = new AbortController();
    abortControllerRef.current = controller;
    let stopped = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const stopPolling = () => {
      stopped = true;
      if (timer !== null) clearTimeout(timer);
      timer = null;
    };

    const runTick = async () => {
      try {
        const statusRes = await fetch(`/api/status/${jobId}`, { signal: controller.signal });
        if (!statusRes.ok) throw new Error(`Status request failed (HTTP ${statusRes.status})`);
        consecutiveErrorsRef.current = 0;
        const s: StatusPayload = await statusRes.json();
        if (typeof s.progress === "number") {
          const clamped = Math.min(100, Math.max(0, Math.round(s.progress)));
          setProgress((prev) => Math.max(prev, clamped));
        }
        if (s.message) setMessage(s.message);

        const validStages = (s.stages ?? []).filter((rec) => isStageKey(rec.stage));
        const doneStages = new Set<StageKey>();
        validStages.forEach((rec, i) => {
          if (i < validStages.length - 1 || s.status !== "processing") doneStages.add(rec.stage);
          if (i >= validStages.length - 1) return;
          const nextAt = validStages[i + 1].at;
          setStageTimes((prev) =>
            prev[rec.stage] !== undefined
              ? prev
              : {
                  ...prev,
                  [rec.stage]: Math.max(new Date(nextAt).getTime() - new Date(rec.at).getTime(), 0),
                },
          );
        });
        setStagesDone(doneStages);
        const lastRec = validStages[validStages.length - 1];
        if (lastRec && s.status === "processing") setActiveStage(lastRec.stage);

        const logRes = await fetch(`/api/logs?jobId=${jobId}&limit=30`, {
          signal: controller.signal,
        });
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
          stopPolling();
          const t = s.result?.timing;
          if (t) {
            setSummary(
              `Extract ${t.extract ?? 0}ms · Analyze ${t.analyze ?? 0}ms · Spec ${t.spec ?? 0}ms · Generate ${t.generate ?? 0}ms · Total ${t.total ?? 0}ms`,
            );
          }
          setStagesDone(new Set(ALL_STAGES));
          setTerminal("completed");
          toast.success("Extraction completed successfully!");
          if (!transitionedRef.current) {
            transitionedRef.current = true;
            transitionTimerRef.current = setTimeout(onCompleted, COMPLETION_DELAY_MS);
          }
          return;
        }
        if (s.status === "failed") {
          stopPolling();
          if (s.error !== CANCELLED_BY_USER) toast.error(s.error || "Extraction failed");
          setSummary(`Failed: ${s.error ?? "unknown error"}`);
          setTerminal("failed");
          return;
        }
      } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") return;
        consecutiveErrorsRef.current += 1;
        if (consecutiveErrorsRef.current >= MAX_CONSECUTIVE_ERRORS) {
          stopPolling();
          toast.error("Lost connection to the extraction server");
          setSummary("Failed: lost connection to the extraction server");
          setTerminal("disconnected");
          return;
        }
      }
      if (!stopped && !controller.signal.aborted) {
        timer = setTimeout(() => void runTick(), POLL_INTERVAL_MS);
      }
    };

    void runTick();

    return () => {
      stopPolling();
      controller.abort();
      if (abortControllerRef.current === controller) abortControllerRef.current = null;
    };
  }, [jobId, onCompleted]);

  useEffect(() => {
    return () => {
      if (transitionTimerRef.current !== null) clearTimeout(transitionTimerRef.current);
    };
  }, []);

  return {
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
  };
}
