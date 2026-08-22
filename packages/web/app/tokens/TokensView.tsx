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

  const { data: resultsData, isLoading } = useQuery({
    queryKey: ["tokens", effectiveJobId],
    queryFn: async (): Promise<any> => {
      if (!effectiveJobId) return null;
      const response = await fetch(`/api/results/${effectiveJobId}`);
      if (!response.ok) return null;
      return response.json();
    },
    enabled: !!effectiveJobId,
  });

  const designSystem = resultsData?.analysis?.designSystem || null;

  // Extract colors from designSystem
  const extractedColors: ColorToken[] = [];
  if (designSystem?.colors?.all?.length) {
    designSystem.colors.all.forEach((value: string, i: number) => {
      if (value && value !== "none" && value !== "transparent") {
        extractedColors.push({
          name: `Color ${i + 1}`,
          varName: `--color-${i + 1}`,
          value,
        });
      }
    });
  }

  // Extract spacing from designSystem
  const extractedSpacing: ExtractedSpacingToken[] = [];
  if (designSystem?.spacing?.all?.length) {
    const sortedSpacing = [...designSystem.spacing.all].sort((a: number, b: number) => a - b);
    sortedSpacing.forEach((val: number, i: number) => {
      const pxValue = `${val}px`;
      const width = Math.min((val / 48) * 100, 100); // 48px max reference
      extractedSpacing.push({
        name: `--space-${i + 1}`,
        value: pxValue,
        width: `${width}%`,
      });
    });
  }

  // Extract typography from designSystem
  const extractedTypography: ExtractedTypographyToken[] = [];
  if (designSystem?.typography?.fontSizes?.length) {
    const sortedSizes = [...designSystem.typography.fontSizes].sort(
      (a: number, b: number) => a - b,
    );
    const weights = designSystem.typography.fontWeights || ["400"];
    const weightMap: Record<number, string> = {
      100: "Thin",
      200: "ExtraLight",
      300: "Light",
      400: "Regular",
      500: "Medium",
      600: "SemiBold",
      700: "Bold",
      800: "ExtraBold",
      900: "Black",
    };
    sortedSizes.forEach((size: number, i: number) => {
      const weight = weights[i % weights.length];
      const weightName = typeof weight === "string" ? weight : String(weight);
      const weightNum = parseInt(weightName, 10) || 400;
      extractedTypography.push({
        name: `--text-${i === 0 ? "xs" : i === 1 ? "sm" : i === 2 ? "base" : i === 3 ? "lg" : "2xl"}`,
        size: `${size}px`,
        weight: weightName,
        usage: `Font size ${size}px`,
        sample: `Sample text at ${size}px`,
      });
    });
  }

  const hasData =
    extractedColors.length > 0 || extractedSpacing.length > 0 || extractedTypography.length > 0;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedToken(text);
    toast.success(`Copied ${label}`);
    setTimeout(() => setCopiedToken(null), 1800);
  };

  const handleExportCSS = () => {
    if (!hasData) return;
    const cssVars = [
      ":root {",
      ...extractedColors.map((c) => `  ${c.varName}: ${c.value};`),
      ...extractedSpacing.map((s) => `  ${s.name}: ${s.value};`),
      ...extractedTypography.map((t) => `  ${t.name}: ${t.size};`),
      "}",
    ].join("\n");
    copyToClipboard(cssVars, "CSS Variables (:root)");
  };

  const handleExportTailwind = () => {
    if (!hasData) return;
    const colorsObj: Record<string, string> = {};
    extractedColors.forEach((c) => {
      const key = c.name.toLowerCase().replace(/\s+/g, "-");
      colorsObj[key] = c.value;
    });

    const spacingObj: Record<string, string> = {};
    extractedSpacing.forEach((s) => {
      const key = s.name.replace(/^--space-/, "space-");
      spacingObj[key] = s.value;
    });

    const config = [
      "// tailwind.config.js - theme.extend",
      "module.exports = {",
      "  theme: {",
      "    extend: {",
      `      colors: ${JSON.stringify(colorsObj, null, 8).replace(/^/gm, "  ").trim()},`,
      `      spacing: ${JSON.stringify(spacingObj, null, 8).replace(/^/gm, "  ").trim()},`,
      "    },",
      "  },",
      "};",
    ].join("\n");

    copyToClipboard(config, "Tailwind Config");
  };

  const handleExportJSON = () => {
    if (!hasData) return;
    const jsonTokens = {
      color: Object.fromEntries(
        extractedColors.map((c) => [
          c.varName.replace(/^--/, ""),
          { $value: c.value, $type: "color" },
        ]),
      ),
      spacing: Object.fromEntries(
        extractedSpacing.map((s) => [
          s.name.replace(/^--/, ""),
          { $value: s.value, $type: "dimension" },
        ]),
      ),
      typography: Object.fromEntries(
        extractedTypography.map((t) => [
          t.name.replace(/^--/, ""),
          { $value: t.size, $type: "dimension" },
        ]),
      ),
    };
    copyToClipboard(JSON.stringify(jsonTokens, null, 2), "W3C JSON Tokens");
  };

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
