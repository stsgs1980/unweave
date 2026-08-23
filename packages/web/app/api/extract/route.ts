/**
 * @file API route for handling UI extraction requests.
 */

import { NextRequest, NextResponse } from "next/server";
import { createJob, updateJob, getJob } from "@/lib/jobStore";
import { logger } from "@/lib/logger";
import {
  createWorkerMessageHandler,
  createWorkerExitHandler,
  WorkerLifecycleState,
  type WorkerLifecycleDeps,
} from "@/lib/worker-lifecycle";
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

    const lifecycle = new WorkerLifecycleState();
    const deps: WorkerLifecycleDeps = {
      saveScreenshots: saveJobScreenshots,
      updateJob,
      getJob,
      unregister: unregisterWorker,
      isCancelled: isJobCancelled,
      log: logger,
    };
    // Listen to worker messages and update DB
    worker.on("message", createWorkerMessageHandler(jobId, lifecycle, deps));

    worker.on("error", (err) => {
      logger.error("API:Extract", `Worker error for job ${jobId}`, err);
      if (!isJobCancelled(jobId) && !lifecycle.terminalStatusSent) {
        lifecycle.terminalStatusSent = true;
        updateJob(jobId, { status: "failed", error: err.message }).catch((dbErr) => {
          logger.error("API:Extract", `Failed to update job ${jobId} on worker error`, dbErr);
        });
      }
    });

    worker.on("exit", (code) => {
      createWorkerExitHandler(
        jobId,
        lifecycle,
        deps,
      )(code).catch((dbErr: unknown) => {
        logger.error("API:Extract", `Failed to finalize job ${jobId} on exit`, dbErr);
      });
    });

    return NextResponse.json({ success: true, jobId });
  } catch (error) {
    logger.error("API:Extract", "Failed to start extraction pipeline", error);
    return NextResponse.json({ error: "[FAIL] Internal Server Error" }, { status: 500 });
  }
}
