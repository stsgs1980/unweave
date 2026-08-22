"use client";

import React from "react";
import { useWizardStore, OutputFormat, EXTRACTION_PRESETS } from "@/store/wizard-store";
import { Code2, Layers, FileCode, Check, Layers2, Image, FileImage, Code } from "lucide-react";

/**
 * Step 2: Extraction options, screenshots, framework selection, extraction phases, and extra flags.
 */
export default function Step2Options() {
  const {
    screenshots,
    setScreenshots,
    format,
    setFormat,
    extraOptions,
    setExtraOptions,
    extractionPhases,
    setExtractionPhases,
    setStep,
  } = useWizardStore();

  const formats: Array<{ id: OutputFormat; name: string; desc: string; icon: any }> = [
    { id: "react", name: "React", desc: "TSX + Tailwind + CVA", icon: Code2 },
    { id: "vue", name: "Vue SFC", desc: "Single File Components", icon: Layers },
    { id: "html", name: "HTML / CSS", desc: "Pure semantic markup", icon: FileCode },
  ];

  const phases: Array<{
    key: keyof typeof EXTRACTION_PRESETS.minimal;
    label: string;
    desc: string;
    icon: any;
  }> = [
    { key: "cssVariables", label: "CSS Variables", desc: "Colors, spacing, tokens", icon: Code },
    { key: "pageMeta", label: "Page Meta", desc: "Title, viewport, SEO", icon: FileImage },
    { key: "elements", label: "UI Elements", desc: "Components, styles, layout", icon: Layers2 },
    { key: "images", label: "Images", desc: "Screenshots, assets", icon: Image },
  ];

  const handleNext = () => {
    setStep(3);
  };

  const handleBack = () => {
    setStep(1);
  };

  const handlePresetChange = (preset: keyof typeof EXTRACTION_PRESETS) => {
    const { applyPreset } = useWizardStore.getState();
    applyPreset(preset);
  };

  const getPresetChecked = (presetName: keyof typeof EXTRACTION_PRESETS) => {
    const { extractionPhases } = useWizardStore.getState();
    const preset = EXTRACTION_PRESETS[presetName];
    return Object.entries(preset).every(
      ([k, v]) => extractionPhases[k as keyof typeof preset] === v,
    );
  };

  return (
    <div className="space-y-5">
      {/* Target Framework */}
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-foreground">
          Target Framework / Format
        </label>
        <div className="grid grid-cols-3 gap-2.5">
          {formats.map((fmt) => {
            const Icon = fmt.icon;
            const isSelected = format === fmt.id;
            return (
              <button
                type="button"
                key={fmt.id}
                onClick={() => setFormat(fmt.id)}
                className={`flex flex-col items-start rounded-lg border p-3 text-left transition-all ${
                  isSelected
                    ? "border-primary bg-primary/10 text-primary shadow-sm"
                    : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
                }`}
              >
                <div className="flex w-full items-center justify-between">
                  <Icon className="h-4 w-4" />
                  {isSelected && <Check className="h-3.5 w-3.5 text-primary" />}
                </div>
                <span className="mt-2 text-xs font-semibold text-foreground">{fmt.name}</span>
                <span className="text-[10px] text-muted-foreground">{fmt.desc}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Extraction Phases */}
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-foreground">
          Extraction Phases
        </label>
        <div className="mb-3 flex flex-wrap gap-2">
          {[
            { key: "minimal", label: "Minimal" },
            { key: "standard", label: "Standard" },
            { key: "full", label: "Full" },
          ].map(({ key, label }) => {
            const isChecked = getPresetChecked(key as keyof typeof EXTRACTION_PRESETS);
            return (
              <button
                type="button"
                key={key}
                onClick={() => handlePresetChange(key as keyof typeof EXTRACTION_PRESETS)}
                className={`rounded-md border px-3 py-1.5 text-xs font-medium transition-all ${
                  isChecked
                    ? "border-primary/50 bg-primary/15 text-primary"
                    : "border-border bg-card text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
        <div className="grid grid-cols-4 gap-2">
          {phases.map((phase) => {
            const isChecked = extractionPhases[phase.key];
            return (
              <button
                type="button"
                key={phase.key}
                onClick={() => setExtractionPhases({ [phase.key]: !isChecked })}
                className={`rounded-md border px-3 py-1.5 text-xs font-medium transition-all ${
                  isChecked
                    ? "border-primary/50 bg-primary/15 text-primary"
                    : "border-border bg-card text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <phase.icon className="h-3.5 w-3.5" />
                  <span>{phase.label}</span>
                </div>
                <div className="text-[10px] text-muted-foreground">{phase.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Screenshot Modes */}
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-foreground">
          Screenshot Modes
        </label>
        <div className="flex flex-wrap gap-2">
          {[
            { key: "fullPage", label: "Full page" },
            { key: "viewport", label: "Viewport" },
            { key: "mobile", label: "Mobile" },
            { key: "sections", label: "Sections" },
          ].map(({ key, label }) => {
            const isChecked = (screenshots as any)[key];
            return (
              <button
                type="button"
                key={key}
                onClick={() => setScreenshots({ [key]: !isChecked })}
                className={`rounded-md border px-3 py-1.5 text-xs font-medium transition-all ${
                  isChecked
                    ? "border-primary/50 bg-primary/15 text-primary"
                    : "border-border bg-card text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                {isChecked ? "+ " : ""}
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Extra generation options */}
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-foreground">
          Extra Generations
        </label>
        <div className="flex flex-wrap gap-2">
          {[
            { key: "typescript", label: "TypeScript" },
            { key: "tailwind", label: "Tailwind CSS" },
            { key: "storybook", label: "Storybook stories" },
            { key: "tests", label: "Auto-tests (Vitest)" },
          ].map(({ key, label }) => {
            const isChecked = (extraOptions as any)[key];
            return (
              <button
                type="button"
                key={key}
                onClick={() => setExtraOptions({ [key]: !isChecked })}
                className={`rounded-md border px-3 py-1.5 text-xs font-medium transition-all ${
                  isChecked
                    ? "border-secondary/60 bg-secondary text-secondary-foreground font-semibold"
                    : "border-border bg-card text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                {isChecked ? "+ " : ""}
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between pt-2">
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
          Next: Element Selection →
        </button>
      </div>
    </div>
  );
}
