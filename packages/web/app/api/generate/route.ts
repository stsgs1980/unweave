/**
 * @file API route for generating React code on demand.
 */

import { NextRequest, NextResponse } from "next/server";
import { getJob } from "@/lib/jobStore";

/**
 * Handles POST requests to generate code for a specific component.
 * @param {NextRequest} request - The incoming request object.
 * @returns {Promise<NextResponse>} A JSON response containing the generated files.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { jobId, componentName } = await request.json();

    if (!jobId || !componentName) {
      return NextResponse.json(
        { error: "[FAIL] Job ID and Component Name are required" },
        { status: 400 },
      );
    }

    const job = getJob(jobId);
    if (!job || !job.result || !job.result.analysis) {
      return NextResponse.json(
        { error: "[FAIL] Analysis data not found for this job" },
        { status: 404 },
      );
    }

    const analysis = job.result.analysis;
    const url = job.result.url;

    const { generateSpec } = await import("@unweave/core/spec");
    const { generate } = await import("@unweave/core/generate");

    const spec = generateSpec(analysis, {
      componentName,
      componentType: "generic",
      source: url,
    });

    const generatedFiles = generate(spec, {
      format: "react",
      typescript: true,
    });

    // Нормализуем вывод: если это строка, оборачиваем в объект
    const files =
      typeof generatedFiles === "string"
        ? { [`${componentName}.tsx`]: generatedFiles }
        : generatedFiles;

    return NextResponse.json({ files });
  } catch (error) {
    console.error("[ERROR] Code generation failed:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: `[FAIL] ${errorMessage}` }, { status: 500 });
  }
}
