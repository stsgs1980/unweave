"use client";

import React, { useEffect } from "react";
import { toast } from "sonner";
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
import { PreviewStage } from "./components/PreviewStage";
import { PropsTable } from "./components/PropsTable";
import { useCodeGeneration } from "./hooks/useCodeGeneration";

interface CodePreviewProps {
  componentName: string | null;
  jobId: string | null;
}

type ViewMode = "split" | "preview" | "code";

/**
 *
 * @param root0
 * @param root0.componentName
 * @param root0.jobId
 */
export default function CodePreview({ componentName, jobId }: CodePreviewProps) {
  const {
    files,
    spec,
    activeTab,
    setActiveTab,
    viewMode,
    setViewMode,
    selectedVariant,
    setSelectedVariant,
    selectedState,
    setSelectedState,
    variants,
    states,
    propsList,
    fallbackData,
    isGenerating,
    generationError,
    isMutationPending,
    handleCopy,
    handleDownload,
    copied,
    currentCode,
    showFallback,
    fallbackCode,
  } = useCodeGeneration({ componentName, jobId, spec: null });

  useEffect(() => {
    if (!componentName) return;
  }, [componentName]);

  if (!componentName) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-center">
        <Code2 className="h-10 w-10 text-muted-foreground/40 mb-3" />
        <p className="text-sm font-medium text-foreground">No component selected</p>
        <p className="text-xs text-muted-foreground mt-1 max-w-sm">
          Select a component from the tree to inspect its live preview and code.
        </p>
      </div>
    );
  }

  const fileNames = Object.keys(files);

  return (
    <div className="flex h-full flex-col bg-background">
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

      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div
          className={`grid gap-6 ${viewMode === "split" ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"}`}
        >
          {viewMode !== "code" && (
            <div className="space-y-6">
              <PreviewStage
                componentName={componentName}
                variants={variants}
                states={states}
                selectedVariant={selectedVariant}
                setSelectedVariant={setSelectedVariant}
                selectedState={selectedState}
                setSelectedState={setSelectedState}
              />
              <PropsTable propsList={propsList} />
            </div>
          )}

          {viewMode !== "preview" && (
            <div className="flex flex-col rounded-xl border border-border bg-card shadow-sm overflow-hidden">
              <div className="flex items-center justify-between border-b border-border bg-muted/40 px-4 py-2.5">
                <span className="font-mono text-xs font-medium text-foreground">
                  {activeTab || "code"}
                </span>
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(currentCode || fallbackCode)}
                    className="h-7 gap-1 px-2 text-xs"
                    isDisabled={!currentCode && !fallbackData}
                  >
                    {copied ? (
                      <Check className="h-3.5 w-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                    Copy
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      handleDownload(activeTab || "component", currentCode || fallbackCode)
                    }
                    className="h-7 gap-1 px-2 text-xs"
                    isDisabled={!currentCode && !fallbackData}
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download
                  </Button>
                </div>
              </div>
              <div className="flex-1 overflow-x-auto p-4 bg-zinc-950 font-mono text-xs text-zinc-200">
                <pre className="whitespace-pre">
                  <code>
                    {showFallback ? (
                      <>
                        <span className="text-zinc-400">{fallbackCode}</span>
                        {fallbackData && (
                          <>
                            <span className="text-zinc-500 ml-2">
                              (Fallback from extracted data)
                            </span>
                          </>
                        )}
                      </>
                    ) : currentCode ? (
                      currentCode
                    ) : (
                      <>
                        <span className="text-zinc-500 flex items-center gap-1">
                          {isGenerating || isMutationPending ? (
                            <>
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              Generating component code...
                            </>
                          ) : generationError ? (
                            <>
                              <AlertCircle className="h-3.5 w-3.5" />
                              {generationError}
                            </>
                          ) : (
                            <>
                              <FileCode className="h-3.5 w-3.5" />
                              No code generated yet. Select a component.
                            </>
                          )}
                        </span>
                      </>
                    )}
                  </code>
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
