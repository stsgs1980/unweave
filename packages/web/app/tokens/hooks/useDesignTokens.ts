"use client";

import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

export interface ExtractedSpacingToken {
  name: string;
  value: string;
  width: string;
}

export interface ExtractedTypographyToken {
  name: string;
  size: string;
  weight: string;
  usage: string;
  sample: string;
}

export interface ExtractedColorToken {
  name: string;
  varName: string;
  value: string;
}

export interface UseDesignTokensReturn {
  extractedColors: ExtractedColorToken[];
  extractedSpacing: ExtractedSpacingToken[];
  extractedTypography: ExtractedTypographyToken[];
  hasData: boolean;
  isLoading: boolean;
  copyToClipboard: (text: string, label: string) => void;
  handleExportCSS: () => void;
  handleExportTailwind: () => void;
  handleExportJSON: () => void;
}

/**
 * Hook for extracting and managing design tokens from analysis results.
 * @param jobId - The job ID to fetch results for
 * @returns Object containing extracted tokens and export handlers
 */
export function useDesignTokens(jobId: string | null): UseDesignTokensReturn {
  const { data: resultsData, isLoading } = useQuery({
    queryKey: ["tokens", jobId],
    queryFn: async (): Promise<any> => {
      if (!jobId) return null;
      const response = await fetch(`/api/results/${jobId}`);
      if (!response.ok) return null;
      return response.json();
    },
    enabled: !!jobId,
  });

  const designSystem = resultsData?.analysis?.designSystem || null;

  // Extract colors from designSystem
  const extractedColors: ExtractedColorToken[] = [];
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
    sortedSizes.forEach((size: number, i: number) => {
      const weight = weights[i % weights.length];
      const weightName = typeof weight === "string" ? weight : String(weight);
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
    toast.success(`Copied ${label}`);
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

  return {
    extractedColors,
    extractedSpacing,
    extractedTypography,
    hasData,
    isLoading,
    copyToClipboard,
    handleExportCSS,
    handleExportTailwind,
    handleExportJSON,
  };
}
