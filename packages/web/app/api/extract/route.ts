/**
 * @file API route for handling UI extraction requests.
 */

import { NextRequest, NextResponse } from "next/server";
import { createJob, updateJob } from "@/lib/jobStore";
import { logger, addLogEntry } from "@/lib/logger";
import { resolveStage } from "@/lib/pipeline-stages";
import { saveJobScreenshots } from "@/lib/screenshot-store";
import {
  registerWorker,
  terminateWorker,
  unregisterWorker,
  markJobCancelled,
  isJobCancelled,
} from "@/lib/worker-registry";
import { isAllowedExtractionUrl } from "@/lib/validate-url";
import { randomUUID } from "crypto";
import { Worker } from "worker_threads";

/**
 * Handles POST requests to start the extraction pipeline in a worker thread.
 * @param {NextRequest} request - The incoming request object.
 * @returns {Promise<NextResponse>} A JSON response with the job ID.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  logger.info("API:Extract", "Received extraction POST request");
  try {
    const body = await request.json();
    const { url, options } = body;

    if (!url || typeof url !== "string" || !isAllowedExtractionUrl(url)) {
      logger.warn("API:Extract", "Invalid or disallowed URL in request", { body });
      return NextResponse.json(
        { error: "[FAIL] URL must be a public http(s) address" },
        { status: 400 },
      );
    }

    const jobId = randomUUID();
    logger.info("API:Extract", `Generated job ID ${jobId} for URL ${url}`);
    await createJob(jobId, url);

    const worker = new Worker(new URL("./extract-worker.ts", import.meta.url), {
      workerData: { url, options: options || {} },
    });
    logger.info("API:Extract", `Worker spawned for job ID ${jobId}`);
    registerWorker(jobId, worker);

    let stages: Array<{ stage: string; at: string }> = [];
    let terminalStatusSent = false;
    // Listen to worker messages and update DB
    worker.on("message", async (msg: any) => {
      try {
        if (isJobCancelled(jobId)) {
          logger.info(
            "API:Extract",
            `Dropping late ${msg.type} message for cancelled job ${jobId}`,
          );
          return;
        }
        if (msg.type === "log" && msg.entry) {
          addLogEntry({ ...msg.entry, jobId });
        } else if (msg.type === "progress") {
          const stage = resolveStage(msg.message ?? "");
          if (stage && (stages.length === 0 || stages[stages.length - 1].stage !== stage)) {
            stages = [...stages, { stage, at: new Date().toISOString() }];
          }
          await updateJob(jobId, {
            status: "processing",
            progress: msg.progress,
            message: msg.message,
            ...(stages.length > 0 ? { stages } : {}),
          });
        } else if (msg.type === "completed") {
          try {
            const saved = await saveJobScreenshots(jobId, msg.result?.extracted?.screenshots);
            if (saved.length > 0) {
              logger.info("API:Extract", `Saved ${saved.length} screenshot(s) for job ${jobId}`);
            }
          } catch (saveError) {
            logger.warn("API:Extract", `Failed to save screenshots for job ${jobId}`, saveError);
          }
          terminalStatusSent = true;
          unregisterWorker(jobId);
          await updateJob(jobId, {
            status: "completed",
            progress: 100,
            result: msg.result,
            message: "Extraction completed",
          });
        } else if (msg.type === "failed") {
          terminalStatusSent = true;
          unregisterWorker(jobId);
          await updateJob(jobId, { status: "failed", error: msg.error });
        }
      } catch (dbError) {
        logger.error("API:Extract", `Failed to update job ${jobId} from worker message`, dbError);
      }
    });

    worker.on("error", (err) => {
      logger.error("API:Extract", `Worker error for job ${jobId}`, err);
      if (!isJobCancelled(jobId) && !terminalStatusSent) {
        terminalStatusSent = true;
        updateJob(jobId, { status: "failed", error: err.message }).catch((dbErr) => {
          logger.error("API:Extract", `Failed to update job ${jobId} on worker error`, dbErr);
        });
      }
    });

    worker.on("exit", (code) => {
      unregisterWorker(jobId);
      if (isJobCancelled(jobId) || terminalStatusSent) {
        logger.info("API:Extract", `Worker exited for job ${jobId} (code ${code})`);
        return;
      }
      if (code !== 0) {
        logger.error(
          "API:Extract",
          `Worker stopped with non-zero exit code ${code} for job ${jobId}`,
        );
        updateJob(jobId, {
          status: "failed",
          error: `Worker crashed unexpectedly (exit code ${code})`,
        }).catch((dbErr) => {
          logger.error("API:Extract", `Failed to mark job ${jobId} failed on exit`, dbErr);
        });
      } else {
        logger.warn("API:Extract", `Worker exited without reporting a result for job ${jobId}`);
        updateJob(jobId, {
          status: "failed",
          error: "Worker finished without reporting a result",
        }).catch((dbErr) => {
          logger.error("API:Extract", `Failed to mark job ${jobId} failed on silent exit`, dbErr);
        });
      }
    });

    return NextResponse.json({ success: true, jobId });
  } catch (error) {
    logger.error("API:Extract", "Failed to start extraction pipeline", error);
    return NextResponse.json({ error: "[FAIL] Internal Server Error" }, { status: 500 });
  }
}
