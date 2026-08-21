/**
 * @file API route for generating React code on demand.
 */

import { NextRequest, NextResponse } from "next/server";
import { getJob } from "@/lib/jobStore";
import { logger } from "@/lib/logger";

/**
 * Handles POST requests to generate code for a specific component.
 * @param {NextRequest} request - The incoming request object.
 * @returns {Promise<NextResponse>} A JSON response containing the generated files.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  logger.info("API:Generate", "Received generation request");
  try {
    const { jobId, componentName } = await request.json();

    if (!jobId || !componentName) {
      logger.warn("API:Generate", "Missing jobId or componentName in request", {
        jobId,
        componentName,
      });
      return NextResponse.json(
        { error: "[FAIL] Job ID and Component Name are required" },
        { status: 400 },
      );
    }

    logger.info("API:Generate", `Fetching job ${jobId} for component ${componentName}`);
    const job = await getJob(jobId);
    if (!job || !job.result || !job.result.analysis) {
      logger.warn("API:Generate", `Analysis data not found for job ${jobId}`);
      return NextResponse.json(
        { error: "[FAIL] Analysis data not found for this job" },
        { status: 404 },
      );
    }

    const analysis = job.result.analysis;
    const url = job.result.url;

    // Try to find matching component metadata to infer component type accurately
    let componentType = "generic";
    if (Array.isArray(analysis.components)) {
      const match = analysis.components.find(
        (c: any) =>
          c.name === componentName ||
          c.tagName?.toLowerCase() === componentName.toLowerCase() ||
          (c.className && String(c.className).includes(componentName)),
      );
      if (match?.type) {
        componentType = match.type;
      }
    }

    if (componentType === "generic") {
      const lower = componentName.toLowerCase();
      if (lower.includes("btn") || lower.includes("button")) componentType = "button";
      else if (lower.includes("input") || lower.includes("search") || lower.includes("field"))
        componentType = "input";
      else if (lower.includes("card") || lower.includes("tile")) componentType = "card";
      else if (lower.includes("nav") || lower.includes("menu") || lower.includes("header"))
        componentType = "navigation";
      else if (lower.includes("modal") || lower.includes("dialog")) componentType = "modal";
      else if (lower.includes("table") || lower.includes("grid")) componentType = "table";
    }

    const { generateSpec } = await import("@unweave/core/spec");
    const { generate } = await import("@unweave/core/generate");

    logger.info(
      "API:Generate",
      `Generating spec and code for component ${componentName} (type: ${componentType})`,
    );
    const spec = generateSpec(analysis, {
      componentName,
      componentType,
      source: url,
    });

    const generatedFiles = generate(spec, {
      format: "react",
      typescript: true,
    });

    // Normalize output: ensure object structure
    const files =
      typeof generatedFiles === "string"
        ? { [`${componentName}.tsx`]: generatedFiles }
        : generatedFiles;

    logger.info("API:Generate", `Successfully generated code for component ${componentName}`);
    return NextResponse.json({ files, spec });
  } catch (error) {
    logger.error("API:Generate", "Code generation failed", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: `[FAIL] ${errorMessage}` }, { status: 500 });
  }
}
