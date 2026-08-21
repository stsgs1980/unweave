"use client";

import React from "react";
import { Palette, Copy, Check } from "lucide-react";

export interface ColorToken {
  name: string;
  varName: string;
  value: string;
}

interface ColorPaletteProps {
  colors: ColorToken[];
  copiedToken: string | null;
  onCopy: (text: string, label: string) => void;
}

/**
 *
 * @param root0
 * @param root0.colors
 * @param root0.copiedToken
 * @param root0.onCopy
 */
export function ColorPalette({ colors, copiedToken, onCopy }: ColorPaletteProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Palette className="h-4 w-4 text-primary" />
          Цветовая палитра ({colors.length})
        </h3>
        <span className="rounded bg-muted px-2 py-0.5 font-mono text-[11px] text-muted-foreground">
          HEX / RGB / CSS
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {colors.map((color, idx) => {
          const isCopied = copiedToken === color.value || copiedToken === color.varName;
          return (
            <button
              type="button"
              key={idx}
              onClick={() => onCopy(color.value, `${color.varName} (${color.value})`)}
              className="group flex flex-col overflow-hidden rounded-lg border border-border bg-background/50 text-left transition-all hover:border-primary/50 hover:shadow-md"
            >
              <div
                className="h-16 w-full transition-transform group-hover:scale-105"
                style={{ backgroundColor: color.value }}
              />
              <div className="p-2.5">
                <div className="flex items-center justify-between">
                  <span className="truncate font-mono text-xs font-semibold text-foreground">
                    {color.varName}
                  </span>
                  {isCopied ? (
                    <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  ) : (
                    <Copy className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </div>
                <span className="mt-0.5 block font-mono text-[10px] text-muted-foreground">
                  {color.value}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
