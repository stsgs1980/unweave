/**
 * @file API route for checking the status of a background job.
 */

import { NextRequest, NextResponse } from "next/server";
import { getJob, updateJob } from "@/lib/jobStore";
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

/**
 * Handles DELETE requests to cancel a running job.
 * @param {NextRequest} request - The incoming request.
 * @param {Object} context - Route context.
 * @param {Object} context.params - Route parameters (Promise in Next.js 16).
 * @returns {NextResponse} The cancelled job status JSON.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;
  logger.info("API:Status", `Cancelling job ${id}`);
  try {
    const job = await getJob(id);

    if (!job) {
      logger.warn("API:Status", `Job not found for cancellation: ${id}`);
      return NextResponse.json({ error: "[FAIL] Job not found" }, { status: 404 });
    }

    if (job.status === "completed" || job.status === "failed") {
      logger.warn("API:Status", `Cannot cancel job ${id} with status: ${job.status}`);
      return NextResponse.json({ error: "[FAIL] Job already finished" }, { status: 400 });
    }

    const cancelledJob = await updateJob(id, {
      status: "failed",
      error: "Cancelled by user",
      progress: 0,
      message: "Cancelled by user",
    });

    logger.info("API:Status", `Job ${id} cancelled successfully`);
    return NextResponse.json({ success: true, job: cancelledJob });
  } catch (error) {
    logger.error("API:Status", `Failed to cancel job ${id}`, error);
    return NextResponse.json({ error: "[FAIL] Internal Server Error" }, { status: 500 });
  }
}
