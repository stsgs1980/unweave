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

    // [TODO] Integrate with @unweave/core pipeline
    console.log(`[INFO] Starting extraction for: ${url}`);

    // Simulate async operation (remove in production)
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return NextResponse.json({
      success: true,
      message: "[OK] Extraction started",
      data: { url },
    });
  } catch (error) {
    console.error("[ERROR] Extraction failed:", error);
    return NextResponse.json({ error: "[FAIL] Internal Server Error" }, { status: 500 });
  }
}
