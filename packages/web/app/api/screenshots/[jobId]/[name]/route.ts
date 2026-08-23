/**
 * @file API route serving a single saved job screenshot as PNG.
 */

import { NextResponse } from "next/server";
import { readJobScreenshot } from "@/lib/screenshot-store";

/**
 * Handles GET requests returning one screenshot image.
 * @param {Object} context - Route context.
 * @param _request
 * @param {Object} context.params - Route parameters (Promise in Next.js 16).
 * @param root0
 * @param root0.params
 * @param _request.params
 * @returns {Promise<NextResponse>} PNG response, or 404 when missing/invalid.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ jobId: string; name: string }> },
): Promise<NextResponse> {
  const { jobId, name } = await params;
  const png = await readJobScreenshot(jobId, name.replace(/\.png$/, ""));
  if (!png) {
    return NextResponse.json({ error: "Screenshot not found" }, { status: 404 });
  }
  return new NextResponse(new Uint8Array(png), {
    status: 200,
    headers: { "Content-Type": "image/png", "Cache-Control": "private, max-age=3600" },
  });
}
