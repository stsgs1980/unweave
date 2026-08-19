/**
 * @file Worker thread script for executing the unweave pipeline.
 */

import { parentPort, workerData } from "worker_threads";

/**
 * Main worker execution logic.
 */
async function run(): Promise<void> {
  if (!parentPort) {
    console.error("[Worker] parentPort is null. Cannot run.");
    return;
  }

  const { url } = workerData as { url: string };

  try {
    parentPort.postMessage({ type: "progress", progress: 10, message: "Starting pipeline..." });

    // Импортируем ядро внутри воркера
    const { pipeline } = await import("@unweave/core/pipeline");

    // Коллбэк для отправки прогресса в основной поток
    const onProgress = (progress: number, message: string) => {
      parentPort?.postMessage({ type: "progress", progress, message });
    };

    const results = await pipeline(url, {}, onProgress);
    const result = results[0];

    if (result.success) {
      parentPort.postMessage({ type: "completed", progress: 100, result });
    } else {
      throw new Error(result.error || "Extraction failed in core");
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown worker error";
    parentPort.postMessage({ type: "failed", error: errorMessage });
  }
}

// Запускаем выполнение
run();
