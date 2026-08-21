/**
 * @file API route for fetching dashboard statistics from Prisma.
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";

/**
 * Handles GET requests to retrieve dashboard statistics.
 * @returns {Promise<NextResponse>} A JSON response containing statistics.
 */
export async function GET(): Promise<NextResponse> {
  try {
    logger.info("API:Stats", "Fetching dashboard stats from Prisma");
    const completedCount = await prisma.job.count({
      where: { status: "completed" },
    });

    return NextResponse.json({
      completedCount,
    });
  } catch (error) {
    logger.error("API:Stats", "Failed to fetch stats from Prisma", error);
    return NextResponse.json(
      { error: "Internal Server Error", completedCount: 0 },
      { status: 500 },
    );
  }
}
