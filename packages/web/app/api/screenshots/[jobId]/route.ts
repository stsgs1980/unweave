/**
 * @file API route listing screenshots saved for a job.
 */

import { NextResponse } from "next/server";
import { listJobScreenshots } from "@/lib/screenshot-store";

/**
 * Handles GET requests returning the list of screenshot names for a job.
 * @param {Object} context - Route context.
 * @param _request
 * @param {Object} context.params - Route parameters (Promise in Next.js 16).
 * @param root0
 * @param root0.params
 * @param _request.params
 * @returns {Promise<NextResponse>} JSON array of screenshot names.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ jobId: string }> },
): Promise<NextResponse> {
  const { jobId } = await params;
  const names = await listJobScreenshots(jobId);
  return NextResponse.json(names);
}
