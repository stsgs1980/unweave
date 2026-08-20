"use client";

/**
 * @file CodePreview component for displaying generated code.
 */

import React, { useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

/**
 * Props for the CodePreview component.
 * @property {string | null} componentName - The name of the selected component.
 * @property {string | null} jobId - The extraction job ID.
 */
interface CodePreviewProps {
  componentName: string | null;
  jobId: string | null;
}

/**
 * Renders a code preview panel with file tabs using shadcn/ui Tabs (react-aria-components).
 * @param {CodePreviewProps} props - The component props.
 * @returns The rendered code preview.
 */
export default function CodePreview({ componentName, jobId }: CodePreviewProps) {
  // Mutation for generating code
  const {
    data: files = {},
    isPending,
    isError,
    error,
    mutate: generateCode,
  } = useMutation({
    mutationFn: async (params: { jobId: string; componentName: string }) => {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to generate code");
      }
      return data.files || {};
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  // Запускаем генерацию при выборе компонента
  useEffect(() => {
    if (componentName && jobId) {
      generateCode({ jobId, componentName });
    }
  }, [componentName, jobId, generateCode]);

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

  const fileNames = Object.keys(files);

  return (
    <div>
      <h2 className="text-lg font-semibold text-foreground">{componentName}</h2>

      {isPending && <p className="mt-4 text-sm text-muted-foreground">Generating code...</p>}

      {isError && <p className="mt-4 text-sm text-destructive">{error?.message}</p>}

      {!isPending && !isError && fileNames.length > 0 && (
        <Tabs className="mt-4">
          <TabsList>
            {fileNames.map((fileName) => (
              <TabsTrigger key={fileName} className="text-xs">
                {fileName}
              </TabsTrigger>
            ))}
          </TabsList>
          {fileNames.map((fileName) => (
            <TabsContent key={fileName}>
              <pre className={codeBlockClass}>
                <code>{files[fileName as keyof typeof files]}</code>
              </pre>
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
}
