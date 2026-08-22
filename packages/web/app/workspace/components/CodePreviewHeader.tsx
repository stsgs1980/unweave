"use client";

import React from "react";
import {
  Copy,
  Check,
  Download,
  Code2,
  Eye,
  Columns,
  Loader2,
  AlertCircle,
  FileCode,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface CodePreviewHeaderProps {
  viewMode: "split" | "preview" | "code";
  setViewMode: (mode: "split" | "preview" | "code") => void;
  fileNames: string[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isGenerating: boolean;
  isMutationPending: boolean;
  generationError: string | null;
  fallbackData: { html: string; css: string } | null;
  copied: boolean;
  handleCopy: (code: string) => void;
  handleDownload: (fileName: string, code: string) => void;
  currentCode: string;
  fallbackCode: string;
}

/**
 * Renders the header/controls for the CodePreview component.
 * @param props - Header props
 * @param props.viewMode
 * @param props.setViewMode
 * @param props.fileNames
 * @param props.activeTab
 * @param props.setActiveTab
 * @param props.isGenerating
 * @param props.isMutationPending
 * @param props.generationError
 * @param props.fallbackData
 * @param props.copied
 * @param props.handleCopy
 * @param props.handleDownload
 * @param props.currentCode
 * @param props.fallbackCode
 * @returns The rendered header controls.
 */
export function CodePreviewHeader({
  viewMode,
  setViewMode,
  fileNames,
  activeTab,
  setActiveTab,
  isGenerating,
  isMutationPending,
  generationError,
  fallbackData,
  copied,
  handleCopy,
  handleDownload,
  currentCode,
  fallbackCode,
}: CodePreviewHeaderProps) {
  const showFallback = !currentCode && !!fallbackData;

  return (
    <div className="flex flex-wrap items-center justify-between border-b border-border bg-muted/20 px-4 py-2 gap-2">
      <div className="flex items-center gap-1 rounded-lg border border-border bg-background p-0.5">
        <button
          type="button"
          onClick={() => setViewMode("split")}
          className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
            viewMode === "split"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Columns className="h-3.5 w-3.5" />
          Split
        </button>
        <button
          type="button"
          onClick={() => setViewMode("preview")}
          className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
            viewMode === "preview"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Eye className="h-3.5 w-3.5" />
          Preview
        </button>
        <button
          type="button"
          onClick={() => setViewMode("code")}
          className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
            viewMode === "code"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Code2 className="h-3.5 w-3.5" />
          Code
        </button>
      </div>

      {fileNames.length > 0 && (
        <div className="flex items-center gap-1 overflow-x-auto">
          {fileNames.map((fileName) => (
            <button
              type="button"
              key={fileName}
              onClick={() => setActiveTab(fileName)}
              className={`rounded-md px-3 py-1 font-mono text-xs font-medium transition-colors ${
                activeTab === fileName
                  ? "bg-background text-foreground shadow-sm border border-border"
                  : "text-muted-foreground hover:bg-background/50 hover:text-foreground"
              }`}
            >
              {fileName}
            </button>
          ))}
        </div>
      )}

      {/* Generation status */}
      <div className="flex items-center gap-2 ml-auto">
        {isGenerating || isMutationPending ? (
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
            Generating...
          </span>
        ) : generationError ? (
          <span className="flex items-center gap-1.5 text-xs text-destructive">
            <AlertCircle className="h-3.5 w-3.5" />
            {showFallback ? "Using extracted fallback" : "Generation failed"}
          </span>
        ) : fileNames.length > 0 ? (
          <span className="text-xs text-emerald-500 flex items-center gap-1">
            <Check className="h-3.5 w-3.5" />
            Ready
          </span>
        ) : null}
      </div>
    </div>
  );
}
