"use client";

import { useEffect, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useWizardStore } from "@/store/wizard-store";

/**
 * Starts the extraction worker for the wizard URL and syncs the jobId into the store.
 * @returns The jobId assigned by the mutation once the request resolves.
 */
export function useExtractMutation(): string | undefined {
  const {
    url,
    viewport,
    componentFocus,
    screenshots,
    format,
    extraOptions,
    selectedElements,
    extractionPhases,
    setJobId,
    setStep,
  } = useWizardStore();

  const {
    mutate,
    reset,
    data: jobIdFromMutation,
  } = useMutation({
    mutationFn: async (targetUrl: string) => {
      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: targetUrl,
          options: {
            viewport,
            componentFocus,
            screenshots,
            format,
            extraOptions,
            selectedElements,
            extractionPhases,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.jobId) throw new Error(data.error || "Failed to start extraction");
      return data.jobId as string;
    },
    onSuccess: (id) => setJobId(id),
    onError: (error: Error) => {
      toast.error(error.message);
      setStep(1);
    },
  });

  useEffect(() => {
    reset();
  }, [url, reset]);

  const lastStartedUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (!url || lastStartedUrlRef.current === url) return;
    lastStartedUrlRef.current = url;
    mutate(url);
  }, [url, mutate]);

  return jobIdFromMutation;
}
