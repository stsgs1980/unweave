/**
 * @file API route for checking the status of a background job.
 */

import { NextRequest, NextResponse } from "next/server";
import { getJob } from "@/lib/jobStore";
import { logger } from "@/lib/logger";

/**
 * Handles GET requests to retrieve job status.
 * @param {NextRequest} request - The incoming request.
 * @param {Object} context - Route context.
 * @param {Object} context.params - Route parameters (Promise in Next.js 16).
 * @returns {NextResponse} The job status JSON.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;
  logger.debug("API:Status", `Fetching status for job ${id}`);
  try {
    const job = await getJob(id);

    if (!job) {
      logger.warn("API:Status", `Job not found: ${id}`);
      return NextResponse.json({ error: "[FAIL] Job not found" }, { status: 404 });
    }

    return NextResponse.json(job);
  } catch (error) {
    logger.error("API:Status", `Failed to fetch status for job ${id}`, error);
    return NextResponse.json({ error: "[FAIL] Internal Server Error" }, { status: 500 });
  }
}
