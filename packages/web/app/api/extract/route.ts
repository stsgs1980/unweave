/**
 * @file API route for handling UI extraction requests.
 */

import { NextRequest, NextResponse } from "next/server";
import { createJob, updateJob } from "@/lib/jobStore";
import { logger, addLogEntry } from "@/lib/logger";
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

    if (!url || typeof url !== "string") {
      logger.warn("API:Extract", "Invalid or missing URL in request", { body });
      return NextResponse.json({ error: "[FAIL] URL is required" }, { status: 400 });
    }

    const jobId = randomUUID();
    logger.info("API:Extract", `Generated job ID ${jobId} for URL ${url}`);
    await createJob(jobId, url);

    const worker = new Worker(new URL("./extract-worker.ts", import.meta.url), {
      workerData: { url, options: options || {} },
    });
    logger.info("API:Extract", `Worker spawned for job ID ${jobId}`);

    // Listen to worker messages and update DB
    worker.on("message", async (msg: any) => {
      try {
        if (msg.type === "log" && msg.entry) {
          addLogEntry(msg.entry);
        } else if (msg.type === "progress") {
          await updateJob(jobId, {
            status: "processing",
            progress: msg.progress,
            message: msg.message,
          });
        } else if (msg.type === "completed") {
          await updateJob(jobId, {
            status: "completed",
            progress: 100,
            result: msg.result,
            message: "Extraction completed",
          });
        } else if (msg.type === "failed") {
          await updateJob(jobId, { status: "failed", error: msg.error });
        }
      } catch (dbError) {
        logger.error("API:Extract", `Failed to update job ${jobId} from worker message`, dbError);
      }
    });

    worker.on("error", (err) => {
      logger.error("API:Extract", `Worker error for job ${jobId}`, err);
      updateJob(jobId, { status: "failed", error: err.message }).catch((dbErr) => {
        logger.error("API:Extract", `Failed to update job ${jobId} on worker error`, dbErr);
      });
    });

    worker.on("exit", (code) => {
      if (code !== 0) {
        logger.error(
          "API:Extract",
          `Worker stopped with non-zero exit code ${code} for job ${jobId}`,
        );
      } else {
        logger.info("API:Extract", `Worker exited successfully for job ${jobId}`);
      }
    });

    return NextResponse.json({ success: true, jobId });
  } catch (error) {
    logger.error("API:Extract", "Failed to start extraction pipeline", error);
    return NextResponse.json({ error: "[FAIL] Internal Server Error" }, { status: 500 });
  }
}
