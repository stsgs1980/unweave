"use client";

/**
 * @file Workspace page for viewing extraction results.
 */

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ComponentTree from "./ComponentTree";
import CodePreview from "./CodePreview";

/**
 * Inner component that uses useSearchParams (requires Suspense boundary).
 */
function WorkspaceContent() {
  const searchParams = useSearchParams();
  const jobId = searchParams.get("jobId");

  const [components, setComponents] = useState<any[]>([]);
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!jobId) {
      setIsLoading(false);
      return;
    }

    /**
     * Fetches results from the API route.
     * @returns {Promise<void>}
     */
    const fetchResults = async (): Promise<void> => {
      try {
        const response = await fetch(`/api/results/${jobId}`);
        if (response.ok) {
          const data = await response.json();
          // Строгая проверка: если components нет, передаем пустой массив
          const extractedComponents = data?.analysis?.components || [];
          setComponents(extractedComponents);
        }
      } catch (error) {
        console.error("[FAIL] Failed to load results:", error);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchResults();
  }, [jobId]);

  return (
    <main className="flex h-screen flex-col">
      <header className="border-b border-border p-4">
        <h1 className="text-xl font-bold text-foreground">Workspace</h1>
        <p className="text-sm text-muted-foreground">
          {jobId ? `Results for job: ${jobId}` : "No job ID provided"}
        </p>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel: Component Tree */}
        <aside className="w-1/3 border-r border-border overflow-y-auto p-4">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading components...</p>
          ) : (
            <ComponentTree components={components} onSelect={setSelectedComponent} />
          )}
        </aside>

        {/* Right Panel: Code Preview */}
        <section className="flex-1 overflow-y-auto p-4">
          <CodePreview componentName={selectedComponent} />
        </section>
      </div>
    </main>
  );
}

/**
 * Renders the split-view workspace layout with Suspense boundary.
 * @returns The workspace page.
 */
export default function WorkspacePage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      }
    >
      <WorkspaceContent />
    </Suspense>
  );
}
