/**
 * @file Worker thread script for executing the unweave pipeline.
 */

import { parentPort, workerData } from "worker_threads";
import { logger } from "@/lib/logger";

/**
 * Main worker execution logic.
 */
async function run(): Promise<void> {
  if (!parentPort) {
    logger.error("Worker", "parentPort is null. Cannot run worker.");
    return;
  }

  const { url, options } = workerData as { url: string; options: any };
  logger.info("Worker", `Worker started for URL: ${url}`, { options });

  try {
    parentPort.postMessage({ type: "progress", progress: 10, message: "Starting pipeline..." });
    logger.info("Worker", "Pipeline set to processing (10%)");

    const { pipeline } = await import("@unweave/core/pipeline");

    const onProgress = (progress: number, message: string) => {
      logger.debug("Worker", `Progress: ${progress}% - ${message}`);
      parentPort?.postMessage({ type: "progress", progress, message });
    };

    logger.info("Worker", `Executing pipeline for ${url}`);
    const results = await pipeline(url, options || {}, onProgress);
    const result = results[0];

    if (result.success) {
      logger.info("Worker", "Pipeline completed successfully");
      parentPort.postMessage({ type: "completed", progress: 100, result });
    } else {
      throw new Error(result.error || "Extraction failed in core");
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown worker error";
    logger.error("Worker", "Extraction failed", error);
    parentPort.postMessage({ type: "failed", error: errorMessage });
  }
}

run();
