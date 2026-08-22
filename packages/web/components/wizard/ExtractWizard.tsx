"use client";

/**
 * @file ExtractWizard component for step-by-step UI extraction.
 */

import React from "react";
import { useWizardStore } from "@/store/wizard-store";
import { motion, AnimatePresence } from "framer-motion";
import { X, Globe, Sliders, Eye, Zap } from "lucide-react";
import Step1Source from "./steps/Step1Source";
import Step2Options from "./steps/Step2Options";
import Step3Preview from "./steps/Step3Preview";
import Step4Summary from "./steps/Step4Summary";
import StepProgress from "./steps/StepProgress";
import StepResult from "./steps/StepResult";

const wizardSteps = [
  { id: 1, title: "Source", icon: Globe },
  { id: 2, title: "Options", icon: Sliders },
  { id: 3, title: "Preview", icon: Eye },
  { id: 4, title: "Summary", icon: Zap },
];

/**
 * Renders the 4-step extraction wizard modal.
 */
export default function ExtractWizard(): React.JSX.Element | null {
  const { step, isOpen, close, setStep } = useWizardStore();

  if (!isOpen) return null;

  const renderStep = () => {
    switch (step) {
      case 1:
        return <Step1Source />;
      case 2:
        return <Step2Options />;
      case 3:
        return <Step3Preview />;
      case 4:
        return <Step4Summary />;
      case "progress":
        return <StepProgress />;
      case "result":
        return <StepResult />;
      default:
        return <Step1Source />;
    }
  };

  const isNumberedStep = typeof step === "number";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
      onClick={close}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="w-full max-w-xl overflow-hidden rounded-xl border border-border bg-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Wizard Header */}
        <div className="border-b border-border bg-muted/20 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-foreground">Extract Wizard</h2>
              <p className="text-xs text-muted-foreground">
                Analyze webpage, extract tokens, and generate React/Vue components
              </p>
            </div>
            <button
              onClick={close}
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              aria-label="Close wizard"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* 4-Step Stepper Header */}
          {isNumberedStep && (
            <div className="mt-4 grid grid-cols-4 gap-2 border-t border-border/60 pt-3">
              {wizardSteps.map((s) => {
                const Icon = s.icon;
                const isCurrent = step === s.id;
                const isCompleted = typeof step === "number" && step > s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => setStep(s.id as any)}
                    className={`flex items-center gap-1.5 rounded-md px-2 py-1 text-left text-xs transition-colors ${
                      isCurrent
                        ? "bg-primary/10 text-primary font-semibold"
                        : isCompleted
                          ? "text-foreground hover:bg-accent"
                          : "text-muted-foreground/60 hover:text-muted-foreground"
                    }`}
                  >
                    <div
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] ${
                        isCurrent
                          ? "bg-primary text-primary-foreground font-bold"
                          : isCompleted
                            ? "bg-emerald-500/20 text-emerald-500 font-bold"
                            : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {s.id}
                    </div>
                    <span className="hidden sm:inline truncate">{s.title}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Wizard Step Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={String(step)}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
