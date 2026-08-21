"use client";

import React from "react";
import { useWizardStore, ViewportMode } from "@/store/wizard-store";
import { Monitor, Tablet, Smartphone, Globe } from "lucide-react";

/**
 * Step 1: Target URL, Viewport selection, and Component focus filter.
 */
export default function Step1Source() {
  const { url, setUrl, viewport, setViewport, componentFocus, setComponentFocus, setStep } =
    useWizardStore();

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      setStep(2);
    }
  };

  const viewports: Array<{ id: ViewportMode; name: string; size: string; icon: any }> = [
    { id: "desktop", name: "Desktop", size: "1280 × 720", icon: Monitor },
    { id: "tablet", name: "Tablet", size: "768 × 1024", icon: Tablet },
    { id: "mobile", name: "Mobile", size: "375 × 667", icon: Smartphone },
  ];

  return (
    <form onSubmit={handleNext} className="space-y-5">
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-foreground">
          Целевой URL сайта
        </label>
        <div className="relative">
          <Globe className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            required
            autoFocus
          />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold text-foreground">
          Разрешение экрана (Viewport)
        </label>
        <div className="grid grid-cols-3 gap-2.5">
          {viewports.map((vp) => {
            const Icon = vp.icon;
            const isSelected = viewport === vp.id;
            return (
              <button
                type="button"
                key={vp.id}
                onClick={() => setViewport(vp.id)}
                className={`flex flex-col items-center justify-center rounded-lg border p-3 text-center transition-all ${
                  isSelected
                    ? "border-primary bg-primary/10 text-primary shadow-sm"
                    : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
                }`}
              >
                <Icon className="mb-1.5 h-5 w-5" />
                <span className="text-xs font-semibold text-foreground">{vp.name}</span>
                <span className="text-[10px] text-muted-foreground">{vp.size}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold text-foreground">
          Фокус на компонентах (опционально)
        </label>
        <input
          type="text"
          value={componentFocus}
          onChange={(e) => setComponentFocus(e.target.value)}
          placeholder="например: buttons, cards, navigation, hero"
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <p className="mt-1 text-[11px] text-muted-foreground">
          Укажите через запятую типы элементов для приоритетной классификации.
        </p>
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          className="rounded-lg bg-primary px-5 py-2 text-xs font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
        >
          Далее: Опции и формат →
        </button>
      </div>
    </form>
  );
}
