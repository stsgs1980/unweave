"use client";

import React from "react";
import { useWizardStore } from "@/store/wizard-store";
import {
  Check,
  Compass,
  Sparkles,
  CreditCard,
  MousePointerClick,
  Table,
  PanelBottom,
} from "lucide-react";

interface MockElement {
  id: string;
  name: string;
  tag: string;
  desc: string;
  icon: any;
}

const candidateElements: MockElement[] = [
  {
    id: "header-nav",
    name: "Header Navigation",
    tag: "<nav.navbar>",
    desc: "Sticky navigation bar with logo and menu links",
    icon: Compass,
  },
  {
    id: "hero-section",
    name: "Hero Section",
    tag: "<header.hero>",
    desc: "Main title, subtitle, and badge container",
    icon: Sparkles,
  },
  {
    id: "cta-buttons",
    name: "CTA Action Buttons",
    tag: "<div.actions>",
    desc: "Primary, secondary, and ghost button groups",
    icon: MousePointerClick,
  },
  {
    id: "feature-cards",
    name: "Feature Cards Grid",
    tag: "<section.features>",
    desc: "Bento grid with icons, titles, and preview cards",
    icon: CreditCard,
  },
  {
    id: "pricing-table",
    name: "Pricing Comparison",
    tag: "<div.pricing>",
    desc: "Tier matrix with feature lists and toggle badges",
    icon: Table,
  },
  {
    id: "footer",
    name: "Site Footer",
    tag: "<footer.main>",
    desc: "Footer links, copyright, and social icons",
    icon: PanelBottom,
  },
];

/**
 * Step 3: Interactive DOM element selection mockup.
 */
export default function Step3Preview() {
  const { url, selectedElements, toggleSelectedElement, setStep } = useWizardStore();

  const handleNext = () => {
    setStep(4);
  };

  const handleBack = () => {
    setStep(2);
  };

  return (
    <div className="space-y-4">
      {/* Mock Browser Frame Header */}
      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <div className="flex items-center gap-2 border-b border-border bg-muted/40 px-3 py-2">
          <div className="flex gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-red-500/60" />
            <div className="h-2.5 w-2.5 rounded-full bg-amber-500/60" />
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/60" />
          </div>
          <span className="truncate rounded bg-background/80 px-2 py-0.5 font-mono text-[11px] text-muted-foreground">
            {url}
          </span>
          <span className="ml-auto text-[11px] font-medium text-primary">
            Selected: {selectedElements.length}
          </span>
        </div>

        {/* Clickable Selectable DOM Blocks */}
        <div className="p-3">
          <p className="mb-2.5 text-[11px] text-muted-foreground">
            Click blocks to prioritize extraction and generate independent components:
          </p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {candidateElements.map((el) => {
              const isSelected = selectedElements.includes(el.id);
              const Icon = el.icon;
              return (
                <button
                  type="button"
                  key={el.id}
                  onClick={() => toggleSelectedElement(el.id)}
                  className={`flex items-start gap-2.5 rounded-lg border p-2.5 text-left transition-all ${
                    isSelected
                      ? "border-primary bg-primary/10 shadow-sm"
                      : "border-border bg-background/50 opacity-60 hover:border-primary/40 hover:opacity-100"
                  }`}
                >
                  <div
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${
                      isSelected
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-foreground">{el.name}</span>
                      {isSelected && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
                    </div>
                    <span className="font-mono text-[10px] text-muted-foreground">{el.tag}</span>
                    <p className="mt-0.5 line-clamp-1 text-[10px] text-muted-foreground/80">
                      {el.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-1">
        <button
          type="button"
          onClick={handleBack}
          className="rounded-lg border border-border px-4 py-2 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          ← Back
        </button>
        <button
          type="button"
          onClick={handleNext}
          className="rounded-lg bg-primary px-5 py-2 text-xs font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
        >
          Next: Summary & Launch →
        </button>
      </div>
    </div>
  );
}
