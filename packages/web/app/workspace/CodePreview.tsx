"use client";

/**
 * @file CodePreview component for displaying generated code.
 */

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

/**
 * Props for the CodePreview component.
 * @property {string | null} componentName - The name of the selected component.
 */
interface CodePreviewProps {
  componentName: string | null;
}

/**
 * Renders a code preview panel with file tabs.
 * @param {CodePreviewProps} props - The component props.
 * @returns The rendered code preview.
 */
export default function CodePreview({ componentName }: CodePreviewProps) {
  const searchParams = useSearchParams();
  const jobId = searchParams.get("jobId");

  const [files, setFiles] = useState<Record<string, string>>({});
  const [activeFile, setActiveFile] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!componentName || !jobId) {
      setFiles({});
      setActiveFile(null);
      return;
    }

    const fetchCode = async (): Promise<void> => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jobId, componentName }),
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "[FAIL] Failed to generate code");
        }

        const newFiles = data.files || {};
        setFiles(newFiles);

        // Устанавливаем активный файл (приоритет .tsx)
        const firstFile =
          Object.keys(newFiles).find((f) => f.endsWith(".tsx")) || Object.keys(newFiles)[0];
        setActiveFile(firstFile || null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    void fetchCode();
  }, [componentName, jobId]);

  const codeBlockClass = [
    "mt-4 rounded-md bg-muted p-4 font-mono text-sm",
    "text-muted-foreground overflow-x-auto whitespace-pre-wrap",
  ].join(" ");

  if (!componentName) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">Select a component to view its code.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-foreground">{componentName}</h2>

      {/* Вкладки файлов */}
      {Object.keys(files).length > 0 && (
        <div className="mt-2 flex gap-2 border-b border-border">
          {Object.keys(files).map((fileName) => (
            <button
              key={fileName}
              onClick={() => setActiveFile(fileName)}
              className={`px-3 py-1 text-xs transition-colors ${
                activeFile === fileName
                  ? "border-b-2 border-primary text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {fileName}
            </button>
          ))}
        </div>
      )}

      {isLoading && <p className="mt-4 text-sm text-muted-foreground">Generating code...</p>}
      {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

      {!isLoading && !error && activeFile && (
        <pre className={codeBlockClass}>
          <code>{files[activeFile]}</code>
        </pre>
      )}
    </div>
  );
}
