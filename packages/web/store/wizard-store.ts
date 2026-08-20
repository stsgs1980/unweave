/**
 * @file Zustand store for the Extract Wizard state.
 */

import { create } from "zustand";

type WizardStep = "url" | "options" | "progress" | "result";

interface WizardState {
  step: WizardStep;
  url: string;
  jobId: string | null;
  options: {
    screenshot: boolean;
    blockMedia: boolean;
  };
  setUrl: (url: string) => void;
  setStep: (step: WizardStep) => void;
  setJobId: (id: string | null) => void;
  setOptions: (options: Partial<WizardState["options"]>) => void;
  reset: () => void;
}

export const useWizardStore = create<WizardState>((set) => ({
  step: "url",
  url: "",
  jobId: null,
  options: {
    screenshot: false,
    blockMedia: true,
  },
  setUrl: (url) => set({ url }),
  setStep: (step) => set({ step }),
  setJobId: (jobId) => set({ jobId }),
  setOptions: (options) => set((state) => ({ options: { ...state.options, ...options } })),
  reset: () => set({ step: "url", url: "", jobId: null }),
}));
