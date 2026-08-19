/**
 * @file Zustand store for the Extract Wizard state.
 */

import { create } from "zustand";

type WizardStep = "url" | "options" | "progress" | "result";

interface WizardState {
  step: WizardStep;
  url: string;
  jobId: string | null;
  setUrl: (url: string) => void;
  setStep: (step: WizardStep) => void;
  setJobId: (id: string | null) => void;
  reset: () => void;
}

export const useWizardStore = create<WizardState>((set) => ({
  step: "url",
  url: "",
  jobId: null,
  setUrl: (url) => set({ url }),
  setStep: (step) => set({ step }),
  setJobId: (jobId) => set({ jobId }),
  reset: () => set({ step: "url", url: "", jobId: null }),
}));
