"use client";

import React from "react";
import Link from "next/link";
import { useWizardStore } from "@/store/wizard-store";
import { CheckCircle2, Layers, Palette, RefreshCw } from "lucide-react";

/**
 * StepResult: Shows completion message with deep-links to Workspace Studio and Tokens View.
 */
export default function StepResult() {
  const { reset, jobId, close } = useWizardStore();

  const handleNewExtraction = () => {
    reset();
  };

  return (
    <div className="space-y-6 py-4 text-center">
      <div className="flex justify-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
          <CheckCircle2 className="h-8 w-8" />
        </div>
      </div>

      <div>
        <h3 className="text-base font-bold text-foreground">Извлечение завершено!</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Компоненты и дизайн-токены сохранены в базе и готовы к инспекции.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
        <Link
          href={`/workspace?jobId=${jobId}`}
          onClick={close}
          className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground shadow transition-colors hover:bg-primary/90"
        >
          <Layers className="h-4 w-4" />
          Открыть Workspace
        </Link>
        <Link
          href={`/tokens?jobId=${jobId}`}
          onClick={close}
          className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-xs font-medium text-foreground hover:bg-accent transition-colors"
        >
          <Palette className="h-4 w-4 text-primary" />
          Смотреть токены
        </Link>
      </div>

      <div className="border-t border-border pt-4">
        <button
          onClick={handleNewExtraction}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground hover:underline"
        >
          <RefreshCw className="h-3 w-3" />
          Запустить новое извлечение
        </button>
      </div>
    </div>
  );
}
