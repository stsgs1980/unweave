"use client";

import React from "react";
import { Sparkles, Loader2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PreviewStageProps {
  componentName: string;
  variants: string[];
  states: string[];
  selectedVariant: string;
  setSelectedVariant: (variant: string) => void;
  selectedState: string;
  setSelectedState: (state: string) => void;
}

/**
 *
 * @param root0
 * @param root0.componentName
 * @param root0.variants
 * @param root0.states
 * @param root0.selectedVariant
 * @param root0.setSelectedVariant
 * @param root0.selectedState
 * @param root0.setSelectedState
 */
export function PreviewStage({
  componentName,
  variants,
  states,
  selectedVariant,
  setSelectedVariant,
  selectedState,
  setSelectedState,
}: PreviewStageProps) {
  const renderPreviewElement = () => {
    const compLower = componentName.toLowerCase();
    const isCard = compLower.includes("card") || compLower.includes("tile");
    const isInput =
      compLower.includes("input") || compLower.includes("search") || compLower.includes("field");

    let variantClasses = "bg-primary text-primary-foreground shadow hover:bg-primary/90";
    if (selectedVariant === "secondary") {
      variantClasses =
        "bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border";
    } else if (selectedVariant === "ghost") {
      variantClasses =
        "bg-transparent text-foreground hover:bg-accent hover:text-accent-foreground";
    } else if (selectedVariant === "outline") {
      variantClasses =
        "bg-background text-foreground border border-input hover:bg-accent hover:text-accent-foreground";
    } else if (selectedVariant === "destructive") {
      variantClasses = "bg-destructive text-destructive-foreground hover:bg-destructive/90";
    }

    let stateClasses = "";
    if (selectedState === "hover") {
      stateClasses = "ring-2 ring-primary/40 brightness-110";
    } else if (selectedState === "focus") {
      stateClasses = "ring-2 ring-ring ring-offset-2 ring-offset-background outline-none";
    } else if (selectedState === "disabled") {
      stateClasses = "opacity-50 cursor-not-allowed pointer-events-none";
    }

    if (isInput) {
      return (
        <div className="w-full max-w-xs space-y-2">
          <label className="text-xs font-medium text-foreground">{componentName}</label>
          <div className="relative">
            <input
              type="text"
              disabled={selectedState === "disabled" || selectedState === "loading"}
              placeholder={`Enter ${componentName}...`}
              className={`w-full rounded-md border border-input bg-background px-3 py-2 text-xs placeholder:text-muted-foreground transition-all ${stateClasses}`}
            />
            {selectedState === "loading" && (
              <Loader2 className="absolute right-2.5 top-2.5 h-3.5 w-3.5 animate-spin text-muted-foreground" />
            )}
          </div>
        </div>
      );
    }

    if (isCard) {
      return (
        <div
          className={`w-full max-w-sm rounded-xl border border-border bg-card p-5 text-card-foreground shadow-sm transition-all ${stateClasses}`}
        >
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold">{componentName}</h4>
            <span className="rounded bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
              {selectedVariant}
            </span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Extracted UI block rendered dynamically with Tailwind classes and variant props.
          </p>
          <div className="mt-4 flex gap-2">
            <Button size="sm" className="h-7 text-xs">
              Action
            </Button>
          </div>
        </div>
      );
    }

    return (
      <button
        type="button"
        disabled={selectedState === "disabled"}
        className={`inline-flex items-center justify-center rounded-md px-4 py-2 text-xs font-medium transition-all ${variantClasses} ${stateClasses}`}
      >
        {selectedState === "loading" && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
        {componentName}
      </button>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
        {/* Variant Controls */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">Variants:</span>
          <div className="flex flex-wrap gap-1">
            {variants.map((variant) => (
              <button
                type="button"
                key={variant}
                onClick={() => setSelectedVariant(variant)}
                className={`rounded-md px-2.5 py-1 text-[11px] font-medium capitalize transition-colors ${
                  selectedVariant === variant
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {variant}
              </button>
            ))}
          </div>
        </div>

        {/* State Controls */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">States:</span>
          <div className="flex flex-wrap gap-1">
            {states.map((state) => (
              <button
                type="button"
                key={state}
                onClick={() => setSelectedState(state)}
                className={`rounded-md px-2.5 py-1 text-[11px] font-medium capitalize transition-colors ${
                  selectedState === state
                    ? "bg-secondary text-secondary-foreground border border-border shadow-sm"
                    : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {state}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Render Canvas */}
      <div className="flex min-h-[160px] items-center justify-center rounded-xl border border-dashed border-border bg-background/50 p-8">
        {renderPreviewElement()}
      </div>
    </div>
  );
}
