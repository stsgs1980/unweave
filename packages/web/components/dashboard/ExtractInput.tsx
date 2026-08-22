"use client";

import React, { useState } from "react";
import { useWizardStore } from "@/store/wizard-store";
import { Globe, Zap, Image, Palette, Box, BookOpen } from "lucide-react";

/**
 * Renders the hero extract input form with URL field, quick chips, and extract launch button.
 */
export default function ExtractInput() {
  const { open, reset } = useWizardStore();
  const [inputUrl, setInputUrl] = useState("https://linear.app");
  const [quickChips, setQuickChips] = useState({
    screenshots: true,
    tokens: true,
    components: true,
    storybook: false,
  });

  const toggleChip = (key: keyof typeof quickChips) => {
    setQuickChips((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputUrl.trim()) {
      reset();
      open(inputUrl.trim());
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-lg font-bold text-foreground">Quick Design System & UI Extraction</h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Enter a website URL to automatically analyze tokens, decompose, and generate component
          code.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2.5">
        <div className="relative flex-1">
          <Globe className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
          <input
            type="url"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            placeholder="https://example.com"
            className="w-full rounded-lg border border-border bg-background py-2.5 pl-10 pr-4 text-xs font-mono placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            required
          />
        </div>

        <button
          type="submit"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-xs font-semibold text-primary-foreground shadow transition-colors hover:bg-primary/90 shrink-0"
        >
          <Zap className="h-4 w-4" />
          Extract UI
        </button>
      </form>

      {/* Quick Option Chips */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-medium text-muted-foreground mr-1">Quick options:</span>
        <button
          type="button"
          onClick={() => toggleChip("screenshots")}
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-medium transition-all ${
            quickChips.screenshots
              ? "border-primary/40 bg-primary/10 text-primary"
              : "border-border bg-card text-muted-foreground hover:bg-accent hover:text-foreground"
          }`}
        >
          <Image className="h-3 w-3" />
          Screenshots
        </button>

        <button
          type="button"
          onClick={() => toggleChip("tokens")}
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-medium transition-all ${
            quickChips.tokens
              ? "border-primary/40 bg-primary/10 text-primary"
              : "border-border bg-card text-muted-foreground hover:bg-accent hover:text-foreground"
          }`}
        >
          <Palette className="h-3 w-3" />
          Design System
        </button>

        <button
          type="button"
          onClick={() => toggleChip("components")}
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-medium transition-all ${
            quickChips.components
              ? "border-primary/40 bg-primary/10 text-primary"
              : "border-border bg-card text-muted-foreground hover:bg-accent hover:text-foreground"
          }`}
        >
          <Box className="h-3 w-3" />
          Components
        </button>

        <button
          type="button"
          onClick={() => toggleChip("storybook")}
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-medium transition-all ${
            quickChips.storybook
              ? "border-primary/40 bg-primary/10 text-primary"
              : "border-border bg-card text-muted-foreground hover:bg-accent hover:text-foreground"
          }`}
        >
          <BookOpen className="h-3 w-3" />
          Storybook
        </button>
      </div>
    </div>
  );
}
