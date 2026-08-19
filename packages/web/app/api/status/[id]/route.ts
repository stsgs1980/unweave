/**
 * @file API route for checking the status of a background job.
 */

import { NextRequest, NextResponse } from "next/server";
import { getJob } from "@/lib/jobStore";

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
  // Разворачиваем Промис, чтобы получить параметры
  const { id } = await params;
  const job = getJob(id);

  if (!job) {
    return NextResponse.json({ error: "[FAIL] Job not found" }, { status: 404 });
  }

  return NextResponse.json(job);
}
