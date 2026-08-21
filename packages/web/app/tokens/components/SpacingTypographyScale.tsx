"use client";

import React from "react";
import { Maximize, Type } from "lucide-react";

export const defaultSpacing = [
  { name: "--space-1", value: "4px", width: "8%" },
  { name: "--space-2", value: "8px", width: "16%" },
  { name: "--space-3", value: "12px", width: "25%" },
  { name: "--space-4", value: "16px", width: "33%" },
  { name: "--space-6", value: "24px", width: "50%" },
  { name: "--space-8", value: "32px", width: "66%" },
  { name: "--space-12", value: "48px", width: "100%" },
];

export const defaultTypography = [
  {
    name: "--text-xs",
    size: "11px",
    weight: "400",
    usage: "Подписи, бейджи, теги",
    sample: "Small caption label",
  },
  {
    name: "--text-sm",
    size: "13px",
    weight: "400",
    usage: "Вторичный текст, подсказки",
    sample: "Secondary body and helper text",
  },
  {
    name: "--text-base",
    size: "15px",
    weight: "500",
    usage: "Основной текст интерфейса",
    sample: "Primary interface content and paragraphs",
  },
  {
    name: "--text-lg",
    size: "18px",
    weight: "600",
    usage: "Подзаголовки карточек",
    sample: "Card subheadings and section headers",
  },
  {
    name: "--text-2xl",
    size: "28px",
    weight: "700",
    usage: "Главные заголовки (H1)",
    sample: "Main page titles and display copy",
  },
];

interface SpacingTypographyScaleProps {
  onCopy: (text: string, label: string) => void;
}

/**
 *
 * @param root0
 * @param root0.onCopy
 */
export function SpacingTypographyScale({ onCopy }: SpacingTypographyScaleProps) {
  return (
    <>
      {/* Spacing Scale Section */}
      <div className="flex flex-col rounded-xl border border-border bg-card p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Maximize className="h-4 w-4 text-primary" />
            Шкала отступов (Spacing Scale)
          </h3>
          <span className="rounded bg-muted px-2 py-0.5 font-mono text-[11px] text-muted-foreground">
            4px Base Grid
          </span>
        </div>

        <div className="flex-1 space-y-3">
          {defaultSpacing.map((space, idx) => (
            <button
              type="button"
              key={idx}
              onClick={() => onCopy(space.value, `${space.name} (${space.value})`)}
              className="flex w-full items-center justify-between gap-4 rounded-lg p-2 transition-colors hover:bg-muted/60 text-left"
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
          ))}
        </div>
      </div>

      {/* Typography Scale Section */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm lg:col-span-2">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Type className="h-4 w-4 text-primary" />
            Шкала типографики (Typography Hierarchy)
          </h3>
          <span className="rounded bg-muted px-2 py-0.5 font-mono text-[11px] text-muted-foreground">
            Geist / Inter Scale
          </span>
        </div>

        <div className="divide-y divide-border">
          {defaultTypography.map((type, idx) => (
            <button
              type="button"
              key={idx}
              onClick={() => onCopy(type.size, `${type.name} (${type.size})`)}
              className="flex w-full flex-col sm:flex-row sm:items-center justify-between gap-4 py-3 text-left transition-colors hover:bg-muted/40 px-2 rounded-md"
            >
              <div className="w-44 shrink-0">
                <span className="font-mono text-xs font-semibold text-foreground">{type.name}</span>
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
          ))}
        </div>
      </div>
    </>
  );
}
