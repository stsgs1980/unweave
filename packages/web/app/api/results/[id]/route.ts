/**
 * @file API route for fetching extraction results by job ID.
 */

import { NextRequest, NextResponse } from "next/server";
import { getJob } from "@/lib/jobStore";

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
  const job = getJob(id);

  if (!job) {
    return NextResponse.json({ error: "[FAIL] Job not found" }, { status: 404 });
  }

  if (job.status !== "completed" || !job.result) {
    return NextResponse.json(
      { error: "[FAIL] Job not completed or no results available" },
      { status: 400 },
    );
  }

  // Возвращаем реальные данные, сохраненные ядром
  return NextResponse.json(job.result);
}
