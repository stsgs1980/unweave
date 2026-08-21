"use client";

import React from "react";
import { useWizardStore } from "@/store/wizard-store";
import { Zap, CheckCircle2 } from "lucide-react";

/**
 * Step 4: Summary card and extraction launch trigger.
 */
export default function Step4Summary() {
  const {
    url,
    viewport,
    componentFocus,
    screenshots,
    format,
    extraOptions,
    selectedElements,
    setStep,
  } = useWizardStore();

  const handleLaunch = () => {
    setStep("progress");
  };

  const handleBack = () => {
    setStep(3);
  };

  const activeScreenshots = Object.entries(screenshots)
    .filter(([_, active]) => active)
    .map(([key]) => key);

  const activeExtras = Object.entries(extraOptions)
    .filter(([_, active]) => active)
    .map(([key]) => key);

  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-border bg-card p-4 space-y-3">
        <div className="flex items-center gap-2 border-b border-border pb-2.5">
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">
            Конфигурация задачи
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-2.5 text-xs sm:grid-cols-2">
          <div>
            <span className="text-muted-foreground">Источник (URL):</span>
            <p className="truncate font-semibold text-foreground">{url}</p>
          </div>

          <div>
            <span className="text-muted-foreground">Разрешение экрана:</span>
            <p className="font-semibold capitalize text-foreground">{viewport}</p>
          </div>

          <div>
            <span className="text-muted-foreground">Выбрано компонентов:</span>
            <p className="font-semibold text-foreground">
              {selectedElements.length} вручную + авто
            </p>
          </div>

          <div>
            <span className="text-muted-foreground">Формат кода:</span>
            <p className="font-semibold uppercase text-primary">{format}</p>
          </div>

          <div>
            <span className="text-muted-foreground">Скриншоты:</span>
            <p className="text-foreground">
              {activeScreenshots.length > 0 ? activeScreenshots.join(", ") : "Выключены"}
            </p>
          </div>

          <div>
            <span className="text-muted-foreground">Опции генерации:</span>
            <p className="text-foreground">
              {activeExtras.length > 0 ? activeExtras.join(", ") : "Стандартные"}
            </p>
          </div>
        </div>

        {componentFocus && (
          <div className="border-t border-border pt-2 text-xs">
            <span className="text-muted-foreground">Фокус на типах:</span>
            <p className="font-mono text-muted-foreground/90">{componentFocus}</p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-1">
        <button
          type="button"
          onClick={handleBack}
          className="rounded-lg border border-border px-4 py-2 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          ← Назад
        </button>
        <button
          type="button"
          onClick={handleLaunch}
          className="flex items-center gap-1.5 rounded-lg bg-primary px-6 py-2 text-xs font-semibold text-primary-foreground shadow transition-colors hover:bg-primary/90"
        >
          <Zap className="h-4 w-4" />
          Запустить извлечение
        </button>
      </div>
    </div>
  );
}
