/**
 * @file API route for handling UI extraction requests.
 */

import { NextRequest, NextResponse } from "next/server";
import { createJob, updateJob } from "@/lib/jobStore";
import { randomUUID } from "crypto";

/**
 * Handles POST requests to start the extraction pipeline in the background.
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
    createJob(jobId);

    // Запускаем пайплайн в фоне, не блокируя ответ.
    // `void` используется, чтобы сказать линтеру, что мы намеренно не используем await.
    void (async () => {
      try {
        updateJob(jobId, { status: "processing", progress: 10 });

        // Импортируем реальную функцию pipeline из ядра
        const { pipeline } = await import("@unweave/core/pipeline");
        updateJob(jobId, { progress: 50 });

        // Вызываем реальный пайплайн
        const results = await pipeline(url, {});
        const result = results[0]; // pipeline всегда возвращает массив

        if (result.success) {
          updateJob(jobId, {
            status: "completed",
            progress: 100,
            result, // Используем сокращенную форму (shorthand)
          });
        } else {
          // Убрали throw, обрабатываем ошибку напрямую
          const errorMessage = result.error || "Extraction failed in core";
          updateJob(jobId, { status: "failed", error: errorMessage });
          return;
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        updateJob(jobId, { status: "failed", error: errorMessage });
      }
    })();

    return NextResponse.json({ success: true, jobId });
  } catch (error) {
    console.error("[ERROR] Failed to start extraction:", error);
    return NextResponse.json({ error: "[FAIL] Internal Server Error" }, { status: 500 });
  }
}
