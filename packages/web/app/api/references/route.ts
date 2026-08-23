/**
 * @file API route for fetching saved references.
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withDbRetry } from "@/lib/jobStore";
import { logger } from "@/lib/logger";

/**
 * Handles GET requests to retrieve a list of saved references with metadata.
 * @returns {Promise<NextResponse>} A JSON response containing an array of references.
 */
export async function GET(): Promise<NextResponse> {
  const list: any[] = [];
  let hasError = false;

  // 1. Load from local filesystem references
  try {
    const { listReferences, loadReference } = await import("@unweave/core/pipeline");
    const names = await listReferences();
    const localRefs = await Promise.all(
      names.map(async (name: string) => {
        const data = await loadReference(name);
        return {
          name,
          url: data?.url || "Unknown URL",
          date: data?.timestamp || new Date().toISOString(),
          category: "Custom",
        };
      }),
    );
    list.push(...localRefs);
  } catch (error) {
    logger.warn("API:References", "Local references folder unavailable", error);
  }

  // 2. Load from Prisma database
  try {
    const dbRefs = await withDbRetry(() => prisma.reference.findMany({ take: 20 }));
    dbRefs.forEach((ref) => {
      list.push({
        name: ref.name,
        url: ref.url,
        date: ref.createdAt.toISOString(),
        category: "Database",
      });
    });
  } catch (error) {
    logger.error("API:References", "Failed to load references from database", error);
    hasError = true;
  }

  if (hasError && list.length === 0) {
    return NextResponse.json({ error: "[FAIL] Failed to load references" }, { status: 503 });
  }

  logger.info("API:References", `Returning ${list.length} reference design systems`);
  return NextResponse.json(list);
}
