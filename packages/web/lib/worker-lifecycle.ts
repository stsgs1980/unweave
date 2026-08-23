/**
 * @file Worker lifecycle state machine: message handling and exit decisions
 * for extraction worker threads, isolated for testability.
 */

import { logger, addLogEntry, type LogEntry } from "@/lib/logger";
import { resolveStage } from "@/lib/pipeline-stages";
import type { Job } from "@/lib/jobStore";

/**
 * Mutable per-worker state shared between message and exit handlers.
 */
export class WorkerLifecycleState {
  terminalStatusSent = false;
  cancelled = false;
  lastMessage = "none";
  stages: Array<{ stage: string; at: string }> = [];
}

export interface WorkerLifecycleDeps {
  saveScreenshots: (
    jobId: string,
    screenshots: Record<string, Uint8Array> | undefined,
  ) => Promise<string[]>;
  updateJob: (id: string, updates: Partial<Job>) => Promise<void>;
  getJob: (id: string) => Promise<Job | undefined>;
  unregister: (id: string) => void;
  isCancelled: (id: string) => boolean;
  log: typeof logger;
}

/**
 * Creates the worker message handler managing job progress and terminal states.
 * The terminal flag is set synchronously before any await to avoid races
 * with the worker exit event.
 * @param {string} jobId - The extraction job id.
 * @param {WorkerLifecycleState} state - Shared lifecycle state.
 * @param {WorkerLifecycleDeps} deps - Injected side effects.
 * @returns Async handler for worker messages.
 */
export function createWorkerMessageHandler(
  jobId: string,
  state: WorkerLifecycleState,
  deps: WorkerLifecycleDeps,
): (msg: any) => Promise<void> {
  return async (msg: any) => {
    try {
      if (state.cancelled || deps.isCancelled(jobId)) {
        deps.log.info(
          "API:Extract",
          `Dropping late ${msg.type} message for cancelled job ${jobId}`,
        );
        return;
      }
      state.lastMessage = `${msg.type}${msg.type === "progress" ? ` ${msg.progress}%` : ""}`;
      if (msg.type === "log" && msg.entry) {
        addLogEntry({ ...(msg.entry as LogEntry), jobId });
      } else if (msg.type === "progress") {
        const stage = resolveStage(msg.message ?? "");
        if (
          stage &&
          (state.stages.length === 0 || state.stages[state.stages.length - 1].stage !== stage)
        ) {
          state.stages = [...state.stages, { stage, at: new Date().toISOString() }];
        }
        await deps.updateJob(jobId, {
          status: "processing",
          progress: msg.progress,
          message: msg.message,
          ...(state.stages.length > 0 ? { stages: state.stages } : {}),
        });
      } else if (msg.type === "completed") {
        state.terminalStatusSent = true;
        try {
          const saved = await deps.saveScreenshots(jobId, msg.result?.extracted?.screenshots);
          if (saved.length > 0) {
            deps.log.info("API:Extract", `Saved ${saved.length} screenshot(s) for job ${jobId}`);
          }
        } catch (saveError) {
          deps.log.warn("API:Extract", `Failed to save screenshots for job ${jobId}`, saveError);
        }
        deps.unregister(jobId);
        await deps.updateJob(jobId, {
          status: "completed",
          progress: 100,
          result: msg.result,
          message: "Extraction completed",
          error: null,
        });
      } else if (msg.type === "failed") {
        state.terminalStatusSent = true;
        deps.unregister(jobId);
        await deps.updateJob(jobId, { status: "failed", error: msg.error });
      }
    } catch (dbError) {
      deps.log.error("API:Extract", `Failed to update job ${jobId} from worker message`, dbError);
    }
  };
}

/**
 * Creates the worker exit handler deciding the final job state.
 * Never overwrites an existing terminal status in the database.
 * @param {string} jobId - The extraction job id.
 * @param {WorkerLifecycleState} state - Shared lifecycle state.
 * @param {WorkerLifecycleDeps} deps - Injected side effects.
 * @returns Async handler for the worker exit event.
 */
export function createWorkerExitHandler(
  jobId: string,
  state: WorkerLifecycleState,
  deps: WorkerLifecycleDeps,
): (code: number) => Promise<void> {
  return async (code: number) => {
    deps.unregister(jobId);
    if (state.cancelled || state.terminalStatusSent) {
      deps.log.info("API:Extract", `Worker exited for job ${jobId} (code ${code})`);
      return;
    }
    const current = await deps.getJob(jobId);
    if (current && (current.status === "completed" || current.status === "failed")) {
      deps.log.warn(
        "API:Extract",
        `Worker exited silently for job ${jobId} but job already ${current.status}; keeping DB state`,
      );
      return;
    }
    if (code !== 0) {
      deps.log.error(
        "API:Extract",
        `Worker stopped with non-zero exit code ${code} for job ${jobId}`,
      );
      await deps.updateJob(jobId, {
        status: "failed",
        error: `Worker crashed unexpectedly (exit code ${code})`,
      });
      return;
    }
    deps.log.warn(
      "API:Extract",
      `Worker exited without reporting a result for job ${jobId} (last message: ${state.lastMessage})`,
    );
    await deps.updateJob(jobId, {
      status: "failed",
      error: `Worker finished without reporting a result (last message: ${state.lastMessage})`,
    });
  };
}
