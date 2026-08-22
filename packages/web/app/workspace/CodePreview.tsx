"use client";

import React, { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
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
import { PropsTable, PropItem } from "./components/PropsTable";

interface CodePreviewProps {
  componentName: string | null;
  jobId: string | null;
}

type ViewMode = "split" | "preview" | "code";

interface ExtractedElement {
  tagName: string;
  className: string | null;
  id: string | null;
  attributes: Record<string, string>;
  computedStyles: Record<string, string>;
  boundingRect: { x: number; y: number; width: number; height: number } | null;
  textContent: string | null;
}

interface FallbackData {
  html: string;
  css: string;
}

/**
 *
 * @param root0
 * @param root0.componentName
 * @param root0.jobId
 */
export default function CodePreview({ componentName, jobId }: CodePreviewProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("");
  const [viewMode, setViewMode] = useState<ViewMode>("split");
  const [selectedVariant, setSelectedVariant] = useState<string>("primary");
  const [selectedState, setSelectedState] = useState<string>("default");
  const [fallbackData, setFallbackData] = useState<FallbackData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  const {
    data,
    mutate: generateCode,
    isPending: isMutationPending,
  } = useMutation({
    mutationFn: async (params: { jobId: string; componentName: string }) => {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });
      const resData = await response.json();
      if (!response.ok) throw new Error(resData.error || "Failed to generate code");
      return {
        files: (resData.files || {}) as Record<string, string>,
        spec: resData.spec || null,
      };
    },
    onError: (err: Error) => {
      setGenerationError(err.message);
      // Fallback: try to build HTML/CSS from extracted data
      fetchFallbackData();
    },
    onSuccess: () => {
      setGenerationError(null);
      setFallbackData(null);
    },
  });

  const files = data?.files || {};
  const spec = data?.spec || null;

  const fetchFallbackData = async () => {
    if (!jobId || !componentName) return;
    try {
      const response = await fetch(`/api/results/${jobId}`);
      if (!response.ok) return;
      const result = await response.json();
      const elements: ExtractedElement[] = result?.extracted?.elements || [];
      const targetEl = elements.find(
        (el) =>
          el.className?.includes(componentName) ||
          el.id === componentName ||
          el.tagName.toLowerCase() === componentName.toLowerCase(),
      );
      if (targetEl) {
        const html = buildFallbackHTML(targetEl);
        const css = buildFallbackCSS(targetEl);
        setFallbackData({ html, css });
      }
    } catch {
      // Silently fail - fallback will just be null
    }
  };

  const buildFallbackHTML = (el: ExtractedElement): string => {
    const tag = el.tagName;
    const classAttr = el.className ? ` class="${el.className}"` : "";
    const idAttr = el.id ? ` id="${el.id}"` : "";
    const text = el.textContent ? `>${el.textContent}<` : ">";
    return `<${tag}${idAttr}${classAttr}${text}/${tag}>`;
  };

  const buildFallbackCSS = (el: ExtractedElement): string => {
    const styles = el.computedStyles || {};
    const relevantStyles: string[] = [];
    const skipProps = new Set(["all", "css-text", "cssfloat", "stylefloat"]);
    for (const [prop, value] of Object.entries(styles)) {
      if (skipProps.has(prop.toLowerCase())) continue;
      if (value && value !== "none" && value !== "normal" && value !== "0px" && value !== "0") {
        // Only include meaningful styles
        if (
          prop.startsWith("color") ||
          prop.startsWith("background") ||
          prop.startsWith("border") ||
          prop.startsWith("font") ||
          prop.startsWith("text") ||
          prop.startsWith("margin") ||
          prop.startsWith("padding") ||
          prop.startsWith("display") ||
          prop.startsWith("flex") ||
          prop.startsWith("grid") ||
          prop.startsWith("width") ||
          prop.startsWith("height") ||
          prop.startsWith("position") ||
          prop.startsWith("top") ||
          prop.startsWith("left") ||
          prop.startsWith("right") ||
          prop.startsWith("bottom") ||
          prop.startsWith("z-index")
        ) {
          relevantStyles.push(`  ${prop}: ${value};`);
        }
      }
    }
    const selector = el.className ? `.${el.className.split(" ")[0]}` : el.tagName;
    return relevantStyles.length > 0
      ? `${selector} {\n${relevantStyles.join("\n")}\n}`
      : `/* No significant computed styles found for ${selector} */`;
  };

  useEffect(() => {
    if (componentName && jobId) {
      setIsGenerating(true);
      setGenerationError(null);
      generateCode({ jobId, componentName });
      setSelectedVariant("primary");
      setSelectedState("default");
    }
  }, [componentName, jobId, generateCode]);

  // Track generation state
  useEffect(() => {
    if (!isMutationPending && isGenerating) {
      setIsGenerating(false);
    }
  }, [isMutationPending, isGenerating]);

  const fileNames = Object.keys(files);

  useEffect(() => {
    if (fileNames.length > 0 && (!activeTab || !fileNames.includes(activeTab))) {
      setActiveTab(fileNames[0]);
    }
  }, [fileNames, activeTab]);

  const handleCopy = (code: string) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success("Code copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = (fileName: string, code: string) => {
    if (!code) return;
    const blob = new Blob([code], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${fileName}`);
  };

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

  const currentCode = files[activeTab] || "";
  const variants: string[] =
    spec?.variants && Array.isArray(spec.variants) && spec.variants.length > 0
      ? spec.variants.map((v: any) => (typeof v === "string" ? v : v.name || v.key))
      : ["primary", "secondary", "ghost", "outline", "destructive"];
  const states: string[] = ["default", "hover", "focus", "disabled", "loading"];

  const propsList: PropItem[] =
    spec?.props && typeof spec.props === "object"
      ? Object.entries(spec.props).map(([key, p]: [string, any]) => ({
          name: key,
          type: p.type || "string",
          defaultVal: p.default !== undefined ? String(p.default) : "-",
          required: p.optional === false,
        }))
      : [
          { name: "variant", type: "string", defaultVal: "primary" },
          { name: "size", type: "string", defaultVal: "md" },
          { name: "disabled", type: "boolean", defaultVal: "false" },
        ];

  // Determine what to show in code view
  const showFallback = !currentCode && fallbackData;
  const fallbackHtml = fallbackData?.html || "";
  const fallbackCss = fallbackData?.css || "";
  const fallbackCode =
    fallbackHtml && fallbackCss
      ? `<!-- HTML -->\n${fallbackHtml}\n\n/* CSS */\n${fallbackCss}`
      : "// No extracted data available for fallback";

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
