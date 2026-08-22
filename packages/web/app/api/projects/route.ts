/**
 * @file API route for fetching recent extraction projects from Prisma.
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";

/**
 * Extracts a display hostname or friendly name from a project URL.
 * @param rawUrl - The raw target URL.
 * @returns The hostname or original URL if parsing fails.
 */
function getHostOrName(rawUrl?: string): string {
  if (!rawUrl) return "Untitled Project";
  try {
    const parsed = new URL(rawUrl.startsWith("http") ? rawUrl : `https://${rawUrl}`);
    return parsed.hostname;
  } catch {
    return rawUrl;
  }
}

/**
 * Handles GET requests to retrieve recent extraction jobs.
 * @param {NextRequest} request - The incoming request.
 * @returns {Promise<NextResponse>} A JSON response containing an array of projects.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get("limit");
    const statusParam = searchParams.get("status");

    const parsedLimit = limitParam ? parseInt(limitParam, 10) : 12;
    const limit = Number.isNaN(parsedLimit) ? 12 : parsedLimit;

    logger.info("API:Projects", `Fetching recent jobs from Prisma (limit: ${limit})`);

    const where = statusParam ? { status: statusParam } : {};
    const rawJobs = await prisma.job.findMany({
      where,
      select: {
        id: true,
        url: true,
        status: true,
        progress: true,
        message: true,
        error: true,
        result: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    const projects = rawJobs.map((job) => {
      const result = job.result as {
        analysis?: {
          components?: unknown[];
          designSystem?: { colors?: unknown[] };
        };
      } | null;
      const components = result?.analysis?.components;
      const colors = result?.analysis?.designSystem?.colors;
      return {
        id: job.id,
        name: getHostOrName(job.url),
        url: job.url || "https://unknown.com",
        date: new Date(job.createdAt).toISOString(),
        status: job.status,
        progress: job.progress,
        message: job.message,
        error: job.error,
        componentCount: components?.length ?? 0,
        tokenCount: colors?.length ?? 0,
      };
    });

    logger.info("API:Projects", `Successfully fetched ${projects.length} recent projects`);
    return NextResponse.json(projects);
  } catch (error) {
    logger.error("API:Projects", "Failed to fetch recent projects from Prisma", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
