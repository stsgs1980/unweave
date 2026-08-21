/**
 * @file API route for fetching recent extraction projects from Prisma.
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";

/**
 *
 * @param rawUrl
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

    const limit = limitParam ? parseInt(limitParam, 10) : 12;
    const where = statusParam ? { status: statusParam } : {};

    logger.info("API:Projects", `Fetching recent jobs from Prisma (limit: ${limit})`);
    const jobs = await prisma.job.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: Number.isNaN(limit) ? 12 : limit,
    });

    const projects = jobs.map((job) => {
      let componentCount = 0;
      let tokenCount = 0;
      if (job.result && typeof job.result === "object") {
        const res = job.result as any;
        if (Array.isArray(res.analysis?.components)) {
          componentCount = res.analysis.components.length;
        }
        if (res.analysis?.designSystem?.colors) {
          tokenCount += res.analysis.designSystem.colors.length;
        }
      }

      return {
        id: job.id,
        name: getHostOrName(job.url),
        url: job.url || "https://unknown.com",
        date: job.createdAt.toISOString(),
        status: job.status,
        progress: job.progress,
        message: job.message,
        error: job.error,
        componentCount,
        tokenCount,
      };
    });

    logger.info("API:Projects", `Successfully fetched ${projects.length} recent projects`);
    return NextResponse.json(projects);
  } catch (error) {
    logger.error("API:Projects", "Failed to fetch recent projects from Prisma", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
