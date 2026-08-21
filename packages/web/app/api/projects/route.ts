/**
 * @file API route for fetching recent extraction projects from Prisma.
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withDbRetry } from "@/lib/jobStore";
import { logger } from "@/lib/logger";

/**
 * Extracts a display hostname or friendly name from a project URL.
 * @param rawUrl - The raw target URL.
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

    const rawJobs = await withDbRetry(async () => {
      try {
        if (statusParam) {
          return await prisma.$queryRaw<any[]>`
            SELECT 
              id, 
              url, 
              status, 
              progress, 
              message, 
              error, 
              "createdAt", 
              "updatedAt",
              CASE 
                WHEN result IS NOT NULL AND (result->'analysis'->'components') IS NOT NULL AND jsonb_typeof((result->'analysis'->'components')::jsonb) = 'array'
                THEN jsonb_array_length((result->'analysis'->'components')::jsonb)
                ELSE 0 
              END as "componentCount",
              CASE 
                WHEN result IS NOT NULL AND (result->'analysis'->'designSystem'->'colors') IS NOT NULL AND jsonb_typeof((result->'analysis'->'designSystem'->'colors')::jsonb) = 'array'
                THEN jsonb_array_length((result->'analysis'->'designSystem'->'colors')::jsonb)
                ELSE 0 
              END as "tokenCount"
            FROM "Job"
            WHERE status = ${statusParam}
            ORDER BY "createdAt" DESC
            LIMIT ${limit};
          `;
        }

        return await prisma.$queryRaw<any[]>`
          SELECT 
            id, 
            url, 
            status, 
            progress, 
            message, 
            error, 
            "createdAt", 
            "updatedAt",
            CASE 
              WHEN result IS NOT NULL AND (result->'analysis'->'components') IS NOT NULL AND jsonb_typeof((result->'analysis'->'components')::jsonb) = 'array'
              THEN jsonb_array_length((result->'analysis'->'components')::jsonb)
              ELSE 0 
            END as "componentCount",
            CASE 
              WHEN result IS NOT NULL AND (result->'analysis'->'designSystem'->'colors') IS NOT NULL AND jsonb_typeof((result->'analysis'->'designSystem'->'colors')::jsonb) = 'array'
              THEN jsonb_array_length((result->'analysis'->'designSystem'->'colors')::jsonb)
              ELSE 0 
            END as "tokenCount"
          FROM "Job"
          ORDER BY "createdAt" DESC
          LIMIT ${limit};
        `;
      } catch (rawError) {
        logger.warn(
          "API:Projects",
          "Falling back to Prisma findMany with metadata select",
          rawError,
        );
        const where = statusParam ? { status: statusParam } : {};
        return await prisma.job.findMany({
          where,
          select: {
            id: true,
            url: true,
            status: true,
            progress: true,
            message: true,
            error: true,
            createdAt: true,
            updatedAt: true,
          },
          orderBy: { createdAt: "desc" },
          take: limit,
        });
      }
    });

    const projects = rawJobs.map((job) => ({
      id: job.id,
      name: getHostOrName(job.url),
      url: job.url || "https://unknown.com",
      date: new Date(job.createdAt).toISOString(),
      status: job.status,
      progress: job.progress,
      message: job.message,
      error: job.error,
      componentCount: Number(job.componentCount || 0),
      tokenCount: Number(job.tokenCount || 0),
    }));

    logger.info("API:Projects", `Successfully fetched ${projects.length} recent projects`);
    return NextResponse.json(projects);
  } catch (error) {
    logger.error("API:Projects", "Failed to fetch recent projects from Prisma", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
