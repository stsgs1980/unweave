"use client";

/**
 * @file ReferencesGrid component for displaying saved references.
 */

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ExternalLink, Bookmark, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Represents a saved reference.
 */
interface Reference {
  name: string;
  url: string;
  date: string;
  category?: string;
  description?: string;
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

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {references.map((ref) => (
        <div
          key={ref.name}
          className="group relative flex flex-col justify-between rounded-lg border border-border bg-card p-5 text-card-foreground transition-all hover:border-primary/40 hover:shadow-sm"
        >
          <div>
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-foreground flex items-center gap-1.5">
                <Bookmark className="h-4 w-4 text-primary" />
                {ref.name}
              </h3>
              {ref.category && (
                <span className="rounded bg-muted px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
                  {ref.category}
                </span>
              )}
            </div>

            <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
              <a
                href={ref.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 hover:text-foreground hover:underline"
              >
                <span className="max-w-[220px] truncate">{ref.url}</span>
                <ExternalLink className="h-3 w-3 shrink-0" />
              </a>
            </div>

            {ref.description && (
              <p className="mt-2 text-xs text-muted-foreground line-clamp-2">{ref.description}</p>
            )}
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3 text-xs text-muted-foreground">
            <span>{new Date(ref.date).toLocaleDateString()}</span>
            <Link href={`/?url=${encodeURIComponent(ref.url)}`}>
              <Button variant="ghost" size="sm" className="h-7 text-xs text-primary gap-1 px-2">
                <Sparkles className="h-3 w-3" />
                Extract UI
              </Button>
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
