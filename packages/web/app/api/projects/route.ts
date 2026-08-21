/**
 * @file API route for fetching recent completed projects from Prisma.
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";

/**
 * Handles GET requests to retrieve a list of 5 recent completed jobs.
 * @returns {Promise<NextResponse>} A JSON response containing an array of projects.
 */
export async function GET(): Promise<NextResponse> {
  try {
    logger.info("API:Projects", "Fetching 5 recent completed jobs from Prisma");
    const jobs = await prisma.job.findMany({
      where: { status: "completed" },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    const projects = jobs.map((job) => ({
      id: job.id,
      name: job.url || "Untitled Project",
      url: job.url || "https://unknown.com",
      date: job.createdAt,
      status: job.status,
    }));

    logger.info("API:Projects", `Successfully fetched ${projects.length} recent projects`);
    return NextResponse.json(projects);
  } catch (error) {
    logger.error("API:Projects", "Failed to fetch recent projects from Prisma", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
