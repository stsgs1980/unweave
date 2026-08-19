"use client";

/**
 * @file ExtractWizard component for step-by-step UI extraction.
 */

import React from "react";
import { useWizardStore } from "@/store/wizard-store";
import { motion, AnimatePresence } from "framer-motion";
import StepUrl from "./steps/StepUrl";
import StepOptions from "./steps/StepOptions";
import StepProgress from "./steps/StepProgress";
import StepResult from "./steps/StepResult";

/**
 * Renders the multi-step extraction wizard.
 * @returns {React.JSX.Element} The wizard container.
 */
export default function ExtractWizard(): React.JSX.Element {
  const step = useWizardStore((state) => state.step);

  const renderStep = () => {
    switch (step) {
      case "url":
        return <StepUrl />;
      case "options":
        return <StepOptions />;
      case "progress":
        return <StepProgress />;
      case "result":
        return <StepResult />;
      default:
        return <StepUrl />;
    }
  };

  const containerClass = [
    "fixed inset-0 z-50 flex items-center justify-center",
    "bg-black/50",
  ].join(" ");

  const modalClass = [
    "w-full max-w-lg rounded-lg border border-border bg-card",
    "p-6 shadow-lg",
  ].join(" ");

  return (
    <div className={containerClass}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={modalClass}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
