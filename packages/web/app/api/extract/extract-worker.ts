/**
 * @file Worker thread script for executing the unweave pipeline.
 */

import { parentPort, workerData } from "worker_threads";
import { logger } from "@/lib/logger";

/**
 *
 * @param level
 * @param message
 * @param data
 */
function sendWorkerLog(level: "info" | "warn" | "error" | "debug", message: string, data?: any) {
  if (level === "info") logger.info("Worker", message, data);
  else if (level === "warn") logger.warn("Worker", message, data);
  else if (level === "error") logger.error("Worker", message, data);
  else if (level === "debug") logger.debug("Worker", message, data);

  parentPort?.postMessage({
    type: "log",
    entry: {
      timestamp: new Date().toISOString(),
      level,
      module: "Worker",
      message,
      data,
    },
  });
}

/**
 * Main worker execution logic.
 */
async function run(): Promise<void> {
  if (!parentPort) {
    logger.error("Worker", "parentPort is null. Cannot run worker.");
    return;
  }

  const { url, options } = workerData as { url: string; options: any };
  sendWorkerLog("info", `Worker started for URL: ${url}`, { options });

  try {
    parentPort.postMessage({ type: "progress", progress: 10, message: "Starting pipeline..." });
    sendWorkerLog("info", "Pipeline set to processing (10%)");

    const { pipeline } = await import("@unweave/core/pipeline");

    const onProgress = (progress: number, message: string) => {
      sendWorkerLog("debug", `Progress: ${progress}% - ${message}`);
      parentPort?.postMessage({ type: "progress", progress, message });
    };

    sendWorkerLog("info", `Executing pipeline for ${url}`);
    const results = await pipeline(url, options || {}, onProgress);
    const result = results[0];

    if (result.success) {
      sendWorkerLog("info", "Pipeline completed successfully");
      parentPort.postMessage({ type: "completed", progress: 100, result });
    } else {
      throw new Error(result.error || "Extraction failed in core");
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown worker error";
    sendWorkerLog("error", "Extraction failed", { error: errorMessage });
    parentPort.postMessage({ type: "failed", error: errorMessage });
  }
}

run();
