/**
 * @file API route for handling UI extraction requests.
 */

import { NextRequest, NextResponse } from "next/server";

/**
 * Handles POST requests to start the extraction pipeline.
 * @param {NextRequest} request - The incoming request object.
 * @returns {Promise<NextResponse>} A JSON response indicating success or failure.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "[FAIL] URL is required" }, { status: 400 });
    }

    console.log(`[INFO] Starting extraction for: ${url}`);

    // Импортируем функцию пайплайна из ядра.
    const { runPipeline } = await import("@unweave/core/pipeline");

    // Запускаем процесс экстракции.
    const result = await runPipeline({ url, outputDir: "extracted_data" });

    if (!result.success) {
      const errorMessage = result.error || "Extraction failed in core";
      return NextResponse.json({ error: `[FAIL] ${errorMessage}` }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "[OK] Extraction completed successfully",
      data: result.data,
    });
  } catch (error) {
    console.error("[ERROR] Extraction failed:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: `[FAIL] ${errorMessage}` }, { status: 500 });
  }
}
