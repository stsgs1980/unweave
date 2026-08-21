/**
 * @file API route for fetching saved references.
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withDbRetry } from "@/lib/jobStore";
import { logger } from "@/lib/logger";

const defaultCuratedReferences = [
  {
    name: "shadcn-ui",
    url: "https://ui.shadcn.com",
    date: new Date().toISOString(),
    category: "Design System",
    description: "Accessible and customizable components built with Radix UI and Tailwind CSS.",
  },
  {
    name: "linear-app",
    url: "https://linear.app",
    date: new Date().toISOString(),
    category: "SaaS / Minimal",
    description: "Streamlined issue tracking design with dark mode and smooth micro-interactions.",
  },
  {
    name: "vercel-design",
    url: "https://vercel.com",
    date: new Date().toISOString(),
    category: "Developer Tools",
    description: "Clean monochrome typography with high contrast borders and geometric grids.",
  },
  {
    name: "stripe-elements",
    url: "https://stripe.com",
    date: new Date().toISOString(),
    category: "Fintech",
    description: "Vibrant gradients, elegant cards, and polished form inputs.",
  },
];

/**
 * Handles GET requests to retrieve a list of saved references with metadata.
 * @returns {Promise<NextResponse>} A JSON response containing an array of references.
 */
export async function GET(): Promise<NextResponse> {
  try {
    const list: any[] = [];

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
    } catch {
      // Local references folder optional
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
    } catch {
      // DB references optional
    }

    // 3. Fallback to curated catalog if none exist yet
    if (list.length === 0) {
      list.push(...defaultCuratedReferences);
    }

    logger.info("API:References", `Returning ${list.length} reference design systems`);
    return NextResponse.json(list);
  } catch (error) {
    logger.error("API:References", "Failed to load references", error);
    return NextResponse.json(defaultCuratedReferences);
  }
}
