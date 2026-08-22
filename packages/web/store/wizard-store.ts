/**
 * @file Zustand store for the Extract Wizard state.
 */

import { create } from "zustand";

export type WizardStep = 1 | 2 | 3 | 4 | "progress" | "result";
export type ViewportMode = "desktop" | "tablet" | "mobile";
export type OutputFormat = "react" | "vue" | "html";

export interface ScreenshotOptions {
  fullPage: boolean;
  viewport: boolean;
  mobile: boolean;
  sections: boolean;
}

export interface ExtraOptions {
  typescript: boolean;
  tailwind: boolean;
  storybook: boolean;
  tests: boolean;
}

/**
 * Extraction phases available for selection
 */
export interface ExtractionPhases {
  cssVariables: boolean;
  pageMeta: boolean;
  elements: boolean;
  images: boolean;
}

/**
 * Preset configurations for extraction phases
 */
export const EXTRACTION_PRESETS: Record<string, ExtractionPhases> = {
  minimal: {
    cssVariables: true,
    pageMeta: true,
    elements: false,
    images: false,
  },
  standard: {
    cssVariables: true,
    pageMeta: true,
    elements: true,
    images: false,
  },
  full: {
    cssVariables: true,
    pageMeta: true,
    elements: true,
    images: true,
  },
  custom: {
    cssVariables: true,
    pageMeta: true,
    elements: true,
    images: true,
  },
};

interface WizardState {
  step: WizardStep;
  url: string;
  viewport: ViewportMode;
  componentFocus: string;
  screenshots: ScreenshotOptions;
  format: OutputFormat;
  extraOptions: ExtraOptions;
  extractionPhases: ExtractionPhases;
  selectedElements: string[];
  jobId: string | null;
  isOpen: boolean;

  setUrl: (url: string) => void;
  setStep: (step: WizardStep) => void;
  setViewport: (viewport: ViewportMode) => void;
  setComponentFocus: (focus: string) => void;
  setScreenshots: (screenshots: Partial<ScreenshotOptions>) => void;
  setFormat: (format: OutputFormat) => void;
  setExtraOptions: (extra: Partial<ExtraOptions>) => void;
  setExtractionPhases: (phases: Partial<ExtractionPhases>) => void;
  applyPreset: (presetName: keyof typeof EXTRACTION_PRESETS) => void;
  toggleSelectedElement: (elementId: string) => void;
  setSelectedElements: (elements: string[]) => void;
  setJobId: (id: string | null) => void;
  reset: () => void;
  open: (initialUrl?: string) => void;
  close: () => void;
}

const initialElements = ["header-nav", "hero-section", "cta-buttons", "feature-cards"];

const defaultPhases: ExtractionPhases = {
  cssVariables: true,
  pageMeta: true,
  elements: true,
  images: false,
};

export const useWizardStore = create<WizardState>((set) => ({
  step: 1,
  url: "https://linear.app",
  viewport: "desktop",
  componentFocus: "buttons, cards, navigation",
  screenshots: {
    fullPage: true,
    viewport: true,
    mobile: false,
    sections: false,
  },
  format: "react",
  extraOptions: {
    typescript: true,
    tailwind: true,
    storybook: true,
    tests: false,
  },
  extractionPhases: defaultPhases,
  selectedElements: ["header-nav", "hero-section", "cta-buttons", "feature-cards"],
  jobId: null,
  isOpen: false,

  setUrl: (url) => set({ url }),
  setStep: (step) => set({ step }),
  setViewport: (viewport) => set({ viewport }),
  setComponentFocus: (componentFocus) => set({ componentFocus }),
  setScreenshots: (opts) => set((state) => ({ screenshots: { ...state.screenshots, ...opts } })),
  setFormat: (format) => set({ format }),
  setExtraOptions: (opts) => set((state) => ({ extraOptions: { ...state.extraOptions, ...opts } })),
  setExtractionPhases: (opts) =>
    set((state) => ({ extractionPhases: { ...state.extractionPhases, ...opts } })),
  applyPreset: (presetName) =>
    set((state) => ({
      extractionPhases: { ...state.extractionPhases, ...EXTRACTION_PRESETS[presetName] },
    })),
  toggleSelectedElement: (elementId) =>
    set((state) => {
      const exists = state.selectedElements.includes(elementId);
      return {
        selectedElements: exists
          ? state.selectedElements.filter((id) => id !== elementId)
          : [...state.selectedElements, elementId],
      };
    }),
  setSelectedElements: (selectedElements) => set({ selectedElements }),
  setJobId: (jobId) => set({ jobId }),
  reset: () =>
    set({
      step: 1,
      jobId: null,
    }),
  open: (initialUrl) =>
    set((state) => ({
      isOpen: true,
      step: 1,
      url: initialUrl || state.url || "https://linear.app",
    })),
  close: () => set({ isOpen: false }),
}));
