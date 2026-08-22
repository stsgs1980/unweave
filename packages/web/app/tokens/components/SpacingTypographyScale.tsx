"use client";

import React from "react";
import { Maximize, Type } from "lucide-react";

export interface ExtractedSpacingToken {
  name: string;
  value: string;
  width: string;
}

export interface ExtractedTypographyToken {
  name: string;
  size: string;
  weight: string;
  usage: string;
  sample: string;
}

interface SpacingTypographyScaleProps {
  onCopy: (text: string, label: string) => void;
  spacing?: ExtractedSpacingToken[];
  typography?: ExtractedTypographyToken[];
}

/**
 * Renders spacing and typography scales from extracted design tokens.
 * @param root0 - Component props
 * @param root0.onCopy - Callback to copy value to clipboard
 * @param root0.spacing - Extracted spacing tokens
 * @param root0.typography - Extracted typography tokens
 * @returns The rendered spacing and typography scale components
 */
export function SpacingTypographyScale({
  onCopy,
  spacing = [],
  typography = [],
}: SpacingTypographyScaleProps) {
  return (
    <>
      {/* Spacing Scale Section */}
      <div className="flex flex-col rounded-xl border border-border bg-card p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Maximize className="h-4 w-4 text-primary" />
            Spacing Scale
          </h3>
          <span className="rounded bg-muted px-2 py-0.5 font-mono text-[11px] text-muted-foreground">
            4px Base Grid
          </span>
        </div>

        <div className="flex-1 space-y-3">
          {spacing.length > 0 ? (
            spacing.map((space, idx) => (
              <button
                type="button"
                key={idx}
                onClick={() => onCopy(space.value, `${space.name} (${space.value})`)}
                className="flex w-full items-center justify-between gap-4 rounded-lg p-2
                  transition-colors hover:bg-muted/60 text-left"
              >
                <span className="w-24 font-mono text-xs font-medium text-foreground">
                  {space.name}
                </span>
                <div className="flex-1">
                  <div className="h-3 rounded bg-primary/20 overflow-hidden">
                    <div className="h-full bg-primary rounded" style={{ width: space.width }} />
                  </div>
                </div>
                <span className="w-12 text-right font-mono text-xs text-muted-foreground">
                  {space.value}
                </span>
              </button>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No spacing tokens extracted. Run an extraction to analyze spacing.
            </p>
          )}
        </div>
      </div>

      {/* Typography Scale Section */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm lg:col-span-2">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Type className="h-4 w-4 text-primary" />
            Typography Hierarchy
          </h3>
          <span className="rounded bg-muted px-2 py-0.5 font-mono text-[11px] text-muted-foreground">
            Geist / Inter Scale
          </span>
        </div>

        <div className="divide-y divide-border">
          {typography.length > 0 ? (
            typography.map((type, idx) => (
              <button
                type="button"
                key={idx}
                onClick={() => onCopy(type.size, `${type.name} (${type.size})`)}
                className="flex w-full flex-col sm:flex-row sm:items-center justify-between
                  gap-4 py-3 text-left transition-colors hover:bg-muted/40 px-2 rounded-md"
              >
                <div className="w-44 shrink-0">
                  <span className="font-mono text-xs font-semibold text-foreground">
                    {type.name}
                  </span>
                  <span className="block text-[11px] text-muted-foreground">{type.usage}</span>
                </div>
                <div className="flex-1 overflow-hidden">
                  <p
                    className="truncate text-foreground"
                    style={{ fontSize: type.size, fontWeight: type.weight }}
                  >
                    {type.sample}
                  </p>
                </div>
                <div className="w-24 text-right shrink-0">
                  <span className="font-mono text-xs font-semibold text-muted-foreground">
                    {type.size}
                  </span>
                  <span className="block font-mono text-[10px] text-muted-foreground/70">
                    w:{type.weight}
                  </span>
                </div>
              </button>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No typography tokens extracted. Run an extraction to analyze typography.
            </p>
          )}
        </div>
      </div>
    </>
  );
}
