"use client";

import React from "react";
import { useWizardStore, OutputFormat } from "@/store/wizard-store";
import { Code2, Layers, FileCode, Check } from "lucide-react";

/**
 * Step 2: Extraction options, screenshots, framework selection, and extra flags.
 */
export default function Step2Options() {
  const { screenshots, setScreenshots, format, setFormat, extraOptions, setExtraOptions, setStep } =
    useWizardStore();

  const formats: Array<{ id: OutputFormat; name: string; desc: string; icon: any }> = [
    { id: "react", name: "React", desc: "TSX + Tailwind + CVA", icon: Code2 },
    { id: "vue", name: "Vue SFC", desc: "Single File Components", icon: Layers },
    { id: "html", name: "HTML / CSS", desc: "Pure semantic markup", icon: FileCode },
  ];

  const handleNext = () => {
    setStep(3);
  };

  const handleBack = () => {
    setStep(1);
  };

  return (
    <div className="space-y-5">
      {/* Target Framework */}
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-foreground">
          Целевой фреймворк / Формат
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

      {/* Screenshot Modes */}
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-foreground">
          Режимы скриншотов
        </label>
        <div className="flex flex-wrap gap-2">
          {[
            { key: "fullPage", label: "Full page" },
            { key: "viewport", label: "Viewport" },
            { key: "mobile", label: "Mobile" },
            { key: "sections", label: "Секции" },
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
          Дополнительные генерации
        </label>
        <div className="flex flex-wrap gap-2">
          {[
            { key: "typescript", label: "TypeScript" },
            { key: "tailwind", label: "Tailwind CSS" },
            { key: "storybook", label: "Storybook stories" },
            { key: "tests", label: "Автотесты (Vitest)" },
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
          ← Назад
        </button>
        <button
          type="button"
          onClick={handleNext}
          className="rounded-lg bg-primary px-5 py-2 text-xs font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
        >
          Далее: Выбор элементов →
        </button>
      </div>
    </div>
  );
}
