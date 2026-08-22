"use client";

/**
 * @file TokensView component for displaying and exporting design tokens.
 */

import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Code2, FileJson, Layers, Sparkles, ArrowRight } from "lucide-react";
import { useWizardStore } from "@/store/wizard-store";
import { Button } from "@/components/ui/button";
import { ColorPalette, ColorToken } from "./components/ColorPalette";
import { SpacingTypographyScale } from "./components/SpacingTypographyScale";
import { useDesignTokens } from "./hooks/useDesignTokens";

interface ExtractedSpacingToken {
  name: string;
  value: string;
  width: string;
}

interface ExtractedTypographyToken {
  name: string;
  size: string;
  weight: string;
  usage: string;
  sample: string;
}

/**
 * Renders the interactive Design Tokens View.
 */
export default function TokensView() {
  const searchParams = useSearchParams();
  const urlJobId = searchParams.get("jobId");
  const wizardJobId = useWizardStore((state) => state.jobId);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const { data: recentProjects = [] } = useQuery<any[]>({
    queryKey: ["projects"],
    queryFn: async (): Promise<any[]> => {
      const response = await fetch("/api/projects");
      if (!response.ok) return [];
      return response.json();
    },
    enabled: !urlJobId && !wizardJobId,
  });

  const effectiveJobId =
    urlJobId ||
    wizardJobId ||
    recentProjects.find((p) => p.status?.toLowerCase() === "completed")?.id ||
    recentProjects[0]?.id ||
    null;

  const {
    extractedColors,
    extractedSpacing,
    extractedTypography,
    hasData,
    isLoading,
    copyToClipboard,
    handleExportCSS,
    handleExportTailwind,
    handleExportJSON,
  } = useDesignTokens(effectiveJobId);

  if (isLoading) {
    return (
      <div className="py-20 text-center text-xs text-muted-foreground animate-pulse">
        Loading design tokens...
      </div>
    );
  }

  if (!hasData) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center rounded-xl border border-border bg-card p-8">
        <Sparkles className="h-12 w-12 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">No Design Tokens Found</h3>
        <p className="text-sm text-muted-foreground mb-6 max-w-md">
          Run an extraction first to analyze a website and generate design tokens.
        </p>
        <Button
          variant="default"
          size="default"
          onClick={() => useWizardStore.getState().open("https://example.com")}
          className="gap-2"
        >
          <ArrowRight className="h-4 w-4" />
          Go to Extraction
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Action Header: Export Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Extracted Design System Palette
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Click any swatch to copy its variable or HEX value.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSS}
            isDisabled={!hasData}
            className="h-8 gap-1.5 text-xs"
          >
            <Code2 className="h-3.5 w-3.5 text-primary" />
            CSS Variables
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportTailwind}
            isDisabled={!hasData}
            className="h-8 gap-1.5 text-xs"
          >
            <Layers className="h-3.5 w-3.5 text-blue-500" />
            Tailwind Config
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportJSON}
            isDisabled={!hasData}
            className="h-8 gap-1.5 text-xs"
          >
            <FileJson className="h-3.5 w-3.5 text-emerald-500" />
            JSON Tokens
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ColorPalette colors={extractedColors} copiedToken={copiedToken} onCopy={copyToClipboard} />
        <SpacingTypographyScale
          onCopy={copyToClipboard}
          spacing={extractedSpacing}
          typography={extractedTypography}
        />
      </div>
    </div>
  );
}
