/**
 * @file API route for handling UI extraction requests.
 */

import { NextRequest, NextResponse } from "next/server";
import { createJob, updateJob } from "@/lib/jobStore";
import { randomUUID } from "crypto";
import { Worker } from "worker_threads";

/**
 * Handles POST requests to start the extraction pipeline in a worker thread.
 * @param {NextRequest} request - The incoming request object.
 * @returns {Promise<NextResponse>} A JSON response with the job ID.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "[FAIL] URL is required" }, { status: 400 });
    }

    const jobId = randomUUID();
    createJob(jobId, url);

    // Правильный способ создания воркера в Next.js (Turbopack/Webpack)
    // Файл extract-worker.ts должен лежать в той же папке, что и route.ts
    const worker = new Worker(new URL("./extract-worker.ts", import.meta.url), {
      workerData: { url },
    });

    // Слушаем сообщения от воркера
    worker.on("message", (msg: any) => {
      if (msg.type === "progress") {
        updateJob(jobId, {
          status: "processing",
          progress: msg.progress,
          message: msg.message,
        });
      } else if (msg.type === "completed") {
        updateJob(jobId, {
          status: "completed",
          progress: 100,
          result: msg.result,
        });
      } else if (msg.type === "failed") {
        updateJob(jobId, { status: "failed", error: msg.error });
      }
    });

    // Обработка ошибок воркера
    worker.on("error", (err) => {
      console.error("[Worker Error]:", err);
      updateJob(jobId, { status: "failed", error: err.message });
    });

    // Завершение воркера
    worker.on("exit", (code) => {
      if (code !== 0) {
        console.error(`[Worker] stopped with exit code ${code}`);
      }
    });

    return NextResponse.json({ success: true, jobId });
  } catch (error) {
    console.error("[ERROR] Failed to start extraction:", error);
    return NextResponse.json({ error: "[FAIL] Internal Server Error" }, { status: 500 });
  }
}
