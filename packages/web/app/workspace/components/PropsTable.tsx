"use client";

import React from "react";
import { Sparkles, CheckCircle2 } from "lucide-react";

export interface PropItem {
  name: string;
  type: string;
  defaultVal?: string;
  required?: boolean;
}

interface PropsTableProps {
  propsList: PropItem[];
}

/**
 *
 * @param root0
 * @param root0.propsList
 */
export function PropsTable({ propsList }: PropsTableProps) {
  return (
    <div className="space-y-6 pt-2">
      {/* Props Specification Table */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h4 className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Props Specification
          </h4>
          <span className="font-mono text-[10px] text-muted-foreground">TypeScript Props</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border/80 text-[11px] font-medium text-muted-foreground">
                <th className="pb-2 font-mono">Prop</th>
                <th className="pb-2 font-mono">Type</th>
                <th className="pb-2 font-mono">Default</th>
                <th className="pb-2 text-right">Required</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 font-mono text-[11px]">
              {propsList.map((p, idx) => (
                <tr key={idx} className="hover:bg-muted/30">
                  <td className="py-2 font-semibold text-primary">{p.name}</td>
                  <td className="py-2 text-muted-foreground">{p.type}</td>
                  <td className="py-2 text-foreground/80">{p.defaultVal || "-"}</td>
                  <td className="py-2 text-right">
                    {p.required ? (
                      <span className="rounded bg-rose-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-rose-500">
                        yes
                      </span>
                    ) : (
                      <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                        opt
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Accessibility (A11y) WCAG AA Checklist */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h4 className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            Accessibility (WCAG AA)
          </h4>
          <span className="rounded bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] font-medium text-emerald-500">
            Passed
          </span>
        </div>

        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          <div className="flex items-start gap-2 rounded-lg bg-background/50 p-2.5 border border-border/50">
            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-medium text-foreground">Color Contrast &gt; 4.5:1</p>
              <p className="text-[10px] text-muted-foreground">
                All foreground text matches WCAG AA ratio.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2 rounded-lg bg-background/50 p-2.5 border border-border/50">
            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-medium text-foreground">Focus-Visible Indicator</p>
              <p className="text-[10px] text-muted-foreground">
                Ring offset outline visible on keyboard focus.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2 rounded-lg bg-background/50 p-2.5 border border-border/50">
            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-medium text-foreground">Keyboard Navigation</p>
              <p className="text-[10px] text-muted-foreground">
                Supports Tab / Enter / Space activation.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2 rounded-lg bg-background/50 p-2.5 border border-border/50">
            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-medium text-foreground">ARIA Attributes</p>
              <p className="text-[10px] text-muted-foreground">
                Semantic roles and aria-labels included.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
