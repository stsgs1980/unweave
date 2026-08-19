"use client";

/**
 * @file ReferencesGrid component for displaying saved references.
 */

import React, { useEffect, useState } from "react";

/**
 * Represents a saved reference.
 * @property {string} name - Reference name.
 * @property {string} url - Source URL.
 * @property {string} date - Date of extraction.
 */
interface Reference {
  name: string;
  url: string;
  date: string;
}

/**
 * Renders a grid of saved references fetched from the API.
 * @returns The rendered references grid.
 */
export default function ReferencesGrid() {
  const [references, setReferences] = useState<Reference[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReferences = async (): Promise<void> => {
      try {
        const response = await fetch("/api/references");
        if (response.ok) {
          const data = await response.json();
          setReferences(data);
        }
      } catch (error) {
        console.error("[FAIL] Failed to load references:", error);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchReferences();
  }, []);

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading references...</p>;
  }

  if (references.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center rounded-lg border border-border">
        <p className="text-sm text-muted-foreground">No saved references found.</p>
      </div>
    );
  }

  const cardClass = [
    "flex flex-col gap-2 rounded-lg border border-border bg-card p-4",
    "text-card-foreground transition-colors hover:bg-accent/50",
  ].join(" ");

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {references.map((ref) => (
        <div key={ref.name} className={cardClass}>
          <h3 className="truncate font-semibold text-foreground">{ref.name}</h3>
          <a
            href={ref.url}
            target="_blank"
            rel="noopener noreferrer"
            className="truncate text-sm text-muted-foreground hover:underline"
          >
            {ref.url}
          </a>
          <p className="mt-auto border-t border-border pt-2 text-xs text-muted-foreground">
            {new Date(ref.date).toLocaleDateString()}
          </p>
        </div>
      ))}
    </div>
  );
}
