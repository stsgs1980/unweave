"use client";

import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

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
interface UseCodeGenerationProps {
  componentName: string | null;
  jobId: string | null;
  spec: any;
}
interface UseCodeGenerationReturn {
  files: Record<string, string>;
  spec: any;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  viewMode: "split" | "preview" | "code";
  setViewMode: (mode: "split" | "preview" | "code") => void;
  selectedVariant: string;
  setSelectedVariant: (variant: string) => void;
  selectedState: string;
  setSelectedState: (state: string) => void;
  variants: string[];
  states: string[];
  propsList: any[];
  fallbackData: FallbackData | null;
  isGenerating: boolean;
  generationError: string | null;
  isMutationPending: boolean;
  handleCopy: (code: string) => void;
  handleDownload: (fileName: string, code: string) => void;
  copied: boolean;
  currentCode: string;
  showFallback: boolean;
  fallbackCode: string;
}

/**
 *
 * @param root0
 * @param root0.componentName
 * @param root0.jobId
 * @param root0.spec
 */
export function useCodeGeneration({
  componentName,
  jobId,
  spec,
}: UseCodeGenerationProps): UseCodeGenerationReturn {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("");
  const [viewMode, setViewMode] = useState<"split" | "preview" | "code">("split");
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
      return { files: (resData.files || {}) as Record<string, string>, spec: resData.spec || null };
    },
    onError: (err: Error) => {
      setGenerationError(err.message);
      fetchFallbackData();
    },
    onSuccess: () => {
      setGenerationError(null);
      setFallbackData(null);
    },
  });

  const files = data?.files || {};
  const specData = data?.spec || spec;

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
      if (targetEl)
        setFallbackData({ html: buildFallbackHTML(targetEl), css: buildFallbackCSS(targetEl) });
    } catch {}
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
  useEffect(() => {
    if (!isMutationPending && isGenerating) setIsGenerating(false);
  }, [isMutationPending, isGenerating]);

  const fileNames = Object.keys(files);
  useEffect(() => {
    if (fileNames.length > 0 && (!activeTab || !fileNames.includes(activeTab)))
      setActiveTab(fileNames[0]);
  }, [fileNames, activeTab]);

  const variants = specData?.variants?.length
    ? specData.variants.map((v: any) => (typeof v === "string" ? v : v.name || v.key))
    : ["primary", "secondary", "ghost", "outline", "destructive"];
  const states = ["default", "hover", "focus", "disabled", "loading"];

  const propsList = specData?.props
    ? Object.entries(specData.props).map(([key, p]: [string, any]) => ({
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

  const currentCode = files[activeTab] || "";
  const showFallback = !currentCode && !!fallbackData;
  const fallbackHtml = fallbackData?.html || "";
  const fallbackCss = fallbackData?.css || "";
  const fallbackCode =
    fallbackHtml && fallbackCss
      ? `<!-- HTML -->\n${fallbackHtml}\n\n/* CSS */\n${fallbackCss}`
      : "// No extracted data available for fallback";

  const handleCopy = (code: string) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    toast.success("Code copied to clipboard");
    setCopied(true);
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
  const handleViewModeChange = (mode: "split" | "preview" | "code") => setViewMode(mode);
  const handleTabChange = (tab: string) => setActiveTab(tab);

  return {
    files,
    spec: specData,
    activeTab,
    setActiveTab,
    viewMode,
    setViewMode: handleViewModeChange,
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
  };
}
