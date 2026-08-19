/**
 * @file API route for fetching saved references.
 */

import { NextResponse } from "next/server";

/**
 * Handles GET requests to retrieve a list of saved references with metadata.
 * @returns {Promise<NextResponse>} A JSON response containing an array of references.
 */
export async function GET(): Promise<NextResponse> {
  try {
    const { listReferences, loadReference } = await import("@unweave/core/pipeline");
    const names = await listReferences();

    // Загружаем метаданные из каждого файла
    const references = await Promise.all(
      names.map(async (name) => {
        const data = await loadReference(name);
        return {
          name,
          url: data?.url || "Unknown URL",
          date: data?.timestamp || new Date().toISOString(),
        };
      }),
    );

    return NextResponse.json(references);
  } catch (error) {
    console.error("[FAIL] Failed to load references:", error);
    return NextResponse.json([]);
  }
}
