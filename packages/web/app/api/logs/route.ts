/**
 * @file API route for fetching and managing application logs.
 */

import { NextRequest, NextResponse } from "next/server";
import { getLogs, clearLogs, LogLevel } from "@/lib/logger";

/**
 * Handles GET requests to retrieve application logs with optional query filters.
 * @param {NextRequest} request - The incoming request.
 * @returns {Promise<NextResponse>} A JSON response containing an array of log entries.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get("limit");
    const levelParam = searchParams.get("level") as LogLevel | "all" | null;
    const moduleParam = searchParams.get("module");

    const limit = limitParam ? parseInt(limitParam, 10) : undefined;
    const logs = getLogs({
      limit: Number.isNaN(limit) ? undefined : limit,
      level: levelParam || undefined,
      module: moduleParam || undefined,
    });

    return NextResponse.json(logs);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * Handles DELETE requests to clear application logs.
 * @returns {Promise<NextResponse>} A JSON response indicating success.
 */
export async function DELETE(): Promise<NextResponse> {
  try {
    clearLogs();
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
