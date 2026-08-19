"use client";

/**
 * @file TokensView component for displaying design tokens.
 */

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

/**
 * Renders the design tokens fetched from the API.
 * @returns The rendered tokens view.
 */
export default function TokensView() {
  const searchParams = useSearchParams();
  const jobId = searchParams.get("jobId");

  const [tokens, setTokens] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!jobId) {
      setIsLoading(false);
      return;
    }

    const fetchTokens = async (): Promise<void> => {
      try {
        const response = await fetch(`/api/results/${jobId}`);
        if (response.ok) {
          const data = await response.json();
          // Ядро возвращает designSystem внутри analysis
          setTokens(data?.analysis?.designSystem || null);
        }
      } catch (error) {
        console.error("[FAIL] Failed to load tokens:", error);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchTokens();
  }, [jobId]);

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading tokens...</p>;
  }

  if (!jobId) {
    return (
      <p className="text-sm text-muted-foreground">No job ID provided. Run an extraction first.</p>
    );
  }

  if (!tokens) {
    return (
      <p className="text-sm text-muted-foreground">No design tokens found in this extraction.</p>
    );
  }

  // Защищенные рендеры для разных структур, которые может вернуть analyze.js
  const colors = tokens.colors || [];
  const typography = tokens.typography || {};
  const spacing = tokens.spacing || {};

  const sectionClass = "rounded-lg border border-border p-4";
  const titleClass = "mb-4 text-lg font-semibold text-foreground";

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      {/* Colors */}
      <div className={sectionClass}>
        <h2 className={titleClass}>Colors ({colors.length})</h2>
        <div className="flex flex-wrap gap-2">
          {Array.isArray(colors) &&
            colors.map((color: any, i: number) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <div
                  className="h-12 w-12 rounded-md border border-border"
                  style={{ backgroundColor: color.value || color.hex || color }}
                />
                <span className="text-xs text-muted-foreground">{color.name || color}</span>
              </div>
            ))}
        </div>
      </div>

      {/* Typography */}
      <div className={sectionClass}>
        <h2 className={titleClass}>Typography</h2>
        <div className="space-y-2">
          {typography.fontFamilies && (
            <p className="text-sm text-muted-foreground">
              Fonts:{" "}
              {Array.isArray(typography.fontFamilies)
                ? typography.fontFamilies.join(", ")
                : typography.fontFamilies}
            </p>
          )}
          {typography.fontSizes && (
            <p className="text-sm text-muted-foreground">
              Sizes:{" "}
              {Array.isArray(typography.fontSizes)
                ? typography.fontSizes.join(", ")
                : typography.fontSizes}
            </p>
          )}
        </div>
      </div>

      {/* Spacing */}
      <div className={`${sectionClass} md:col-span-2`}>
        <h2 className={titleClass}>Spacing</h2>
        <div className="flex flex-wrap items-end gap-4">
          {Object.keys(spacing).length > 0 ? (
            Object.entries(spacing).map(([name, value]: [string, any]) => (
              <div key={name} className="flex flex-col items-center gap-1">
                <div
                  className="w-8 rounded-sm bg-primary/20 border border-primary/50"
                  style={{ height: `${parseInt(String(value)) || 0}px` }}
                />
                <span className="text-xs text-muted-foreground">{name}</span>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No spacing tokens found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
