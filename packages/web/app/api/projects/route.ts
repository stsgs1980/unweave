/**
 * @file API route for fetching recent projects (references) from the core.
 */

import { NextResponse } from "next/server";

/**
 * Handles GET requests to retrieve a list of recent projects.
 * @returns {Promise<NextResponse>} A JSON response containing an array of projects.
 */
export async function GET(): Promise<NextResponse> {
  try {
    // Динамический импорт ядра. Если оно не собрано или недоступно,
    // перехватываем ошибку и возвращаем моковые данные.
    const { listReferences } = await import("@unweave/core");
    const references = await listReferences();

    const projects = references.map((ref: any) => ({
      id: ref.id || Math.random().toString(),
      name: ref.name || "Untitled Project",
      url: ref.url || "https://unknown.com",
      date: ref.date || new Date().toISOString().split("T")[0],
      status: "Completed",
    }));

    return NextResponse.json(projects);
  } catch (error) {
    console.warn("[WARN] Core not available, using mock data:", error);

    // Моковые данные для разработки UI
    const mockProjects = [
      {
        id: "1",
        name: "E-commerce Layout (Mock)",
        url: "https://example-shop.com",
        date: "2023-10-25",
        status: "Completed",
      },
      {
        id: "2",
        name: "SaaS Landing Page (Mock)",
        url: "https://example-saas.com",
        date: "2023-10-20",
        status: "Completed",
      },
    ];
    return NextResponse.json(mockProjects);
  }
}
