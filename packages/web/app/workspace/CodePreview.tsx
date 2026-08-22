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
import { CodePreviewHeader } from "./components/CodePreviewHeader";
import { formatCode } from "./utils/code-formatter";

interface CodePreviewProps {
  componentName: string | null;
  jobId: string | null;
}

type ViewMode = "split" | "preview" | "code";

/**
 * Renders the code preview panel with live preview and generated code.
 * @param props - Component props
 * @param props.componentName - Name of the component to preview
 * @param props.jobId - Job ID for generating code
 * @returns The rendered code preview panel.
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
      <CodePreviewHeader
        viewMode={viewMode}
        setViewMode={setViewMode}
        fileNames={fileNames}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isGenerating={isGenerating}
        isMutationPending={isMutationPending}
        generationError={generationError}
        fallbackData={fallbackData}
        copied={copied}
        handleCopy={handleCopy}
        handleDownload={handleDownload}
        currentCode={currentCode}
        fallbackCode={fallbackCode}
      />

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
                        {(() => {
                          const htmlMatch = fallbackCode.match(
                            /<!-- HTML -->([\s\S]*?)\n\/\* CSS \*\//,
                          );
                          const cssMatch = fallbackCode.match(/\/\* CSS \*\/([\s\S]*)/);
                          return (
                            <>
                              {htmlMatch && (
                                <span className="text-zinc-400">
                                  {formatCode(htmlMatch[1].trim(), "html")}
                                </span>
                              )}
                              {cssMatch && (
                                <>
                                  <span className="text-zinc-500">\n/* CSS */\n</span>
                                  <span className="text-zinc-400">
                                    {formatCode(cssMatch[1].trim(), "css")}
                                  </span>
                                </>
                              )}
                            </>
                          );
                        })()}
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
