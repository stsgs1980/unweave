/**
 * @file API route for fetching extraction results by job ID.
 */

import { NextRequest, NextResponse } from "next/server";
import { getJob } from "@/lib/jobStore";
import { logger } from "@/lib/logger";

/**
 * Handles GET requests to retrieve extraction results.
 * @param {NextRequest} request - The incoming request.
 * @param {Object} context - Route context.
 * @param {Object} context.params - Route parameters (Promise in Next.js 16).
 * @returns {NextResponse} The extraction results JSON.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;
  logger.info("API:Results", `Fetching results for job ${id}`);
  try {
    const job = await getJob(id);

    if (!job) {
      logger.warn("API:Results", `Job not found: ${id}`);
      return NextResponse.json({ error: "[FAIL] Job not found" }, { status: 404 });
    }

    if (job.status !== "completed" || !job.result) {
      logger.warn(
        "API:Results",
        `Job ${id} not completed or results missing (status: ${job.status})`,
      );
      return NextResponse.json(
        { error: "[FAIL] Job not completed or no results available" },
        { status: 400 },
      );
    }

    logger.info("API:Results", `Returning results for job ${id}`);
    return NextResponse.json(job.result);
  } catch (error) {
    logger.error("API:Results", `Failed to fetch results for job ${id}`, error);
    return NextResponse.json({ error: "[FAIL] Internal Server Error" }, { status: 500 });
  }
}
