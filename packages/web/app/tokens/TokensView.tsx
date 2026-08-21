"use client";

/**
 * @file TokensView component for displaying and exporting design tokens.
 */

import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Code2, FileJson, Layers, Sparkles } from "lucide-react";
import { useWizardStore } from "@/store/wizard-store";
import { Button } from "@/components/ui/button";
import { ColorPalette, ColorToken } from "./components/ColorPalette";
import {
  SpacingTypographyScale,
  defaultSpacing,
  defaultTypography,
} from "./components/SpacingTypographyScale";

const defaultSemanticColors: ColorToken[] = [
  { name: "Primary", varName: "--primary", value: "#6366f1" },
  { name: "Accent", varName: "--accent", value: "#8b5cf6" },
  { name: "Background", varName: "--background", value: "#0b0b10" },
  { name: "Foreground", varName: "--foreground", value: "#eceaf4" },
  { name: "Success", varName: "--success", value: "#10b981" },
  { name: "Warning", varName: "--warning", value: "#f59e0b" },
  { name: "Destructive", varName: "--destructive", value: "#ef4444" },
  { name: "Info", varName: "--info", value: "#38bdf8" },
];

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

  const extractedColors: ColorToken[] = [];
  if (designSystem?.colors && Array.isArray(designSystem.colors)) {
    designSystem.colors.forEach((c: any, i: number) => {
      const val = c.value || c.hex || (typeof c === "string" ? c : "#6366f1");
      if (val && val !== "none" && val !== "transparent") {
        extractedColors.push({
          name: c.name || `Color ${i + 1}`,
          varName: `--color-${i + 1}`,
          value: val,
        });
      }
    });
  }

  const colorsToDisplay = extractedColors.length > 0 ? extractedColors : defaultSemanticColors;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedToken(text);
    toast.success(`Copied ${label}`);
    setTimeout(() => setCopiedToken(null), 1800);
  };

  const handleExportCSS = () => {
    const cssVars = [
      ":root {",
      ...colorsToDisplay.map((c) => `  ${c.varName}: ${c.value};`),
      ...defaultSpacing.map((s) => `  ${s.name}: ${s.value};`),
      ...defaultTypography.map((t) => `  ${t.name}: ${t.size};`),
      "}",
    ].join("\n");
    copyToClipboard(cssVars, "CSS Variables (:root)");
  };

  const handleExportTailwind = () => {
    const colorsObj: Record<string, string> = {};
    colorsToDisplay.forEach((c) => {
      const key = c.name.toLowerCase().replace(/\s+/g, "-");
      colorsObj[key] = c.value;
    });

    const config = [
      "// tailwind.config.js - theme.extend",
      "module.exports = {",
      "  theme: {",
      "    extend: {",
      `      colors: ${JSON.stringify(colorsObj, null, 8).replace(/^/gm, "  ").trim()},`,
      "    },",
      "  },",
      "};",
    ].join("\n");

    copyToClipboard(config, "Tailwind Config");
  };

  const handleExportJSON = () => {
    const jsonTokens = {
      color: Object.fromEntries(
        colorsToDisplay.map((c) => [
          c.varName.replace(/^--/, ""),
          { $value: c.value, $type: "color" },
        ]),
      ),
      spacing: Object.fromEntries(
        defaultSpacing.map((s) => [
          s.name.replace(/^--/, ""),
          { $value: s.value, $type: "dimension" },
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
            className="h-8 gap-1.5 text-xs"
          >
            <Code2 className="h-3.5 w-3.5 text-primary" />
            CSS Variables
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportTailwind}
            className="h-8 gap-1.5 text-xs"
          >
            <Layers className="h-3.5 w-3.5 text-blue-500" />
            Tailwind Config
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportJSON}
            className="h-8 gap-1.5 text-xs"
          >
            <FileJson className="h-3.5 w-3.5 text-emerald-500" />
            JSON Tokens
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ColorPalette colors={colorsToDisplay} copiedToken={copiedToken} onCopy={copyToClipboard} />
        <SpacingTypographyScale onCopy={copyToClipboard} />
      </div>
    </div>
  );
}
