"use client";

import { PIPELINE_STAGES, StageKey } from "@/lib/pipeline-stages";

interface StageStepperProps {
  stagesDone: Set<StageKey>;
  activeStage: StageKey;
  stageTimes: Partial<Record<StageKey, number>>;
  hasFailed: boolean;
}

/**
 * Renders the four-stage extraction stepper with per-stage states and timings.
 * @param {StageStepperProps} props - Stage states and durations.
 * @returns The rendered stepper.
 */
export default function StageStepper({
  stagesDone,
  activeStage,
  stageTimes,
  hasFailed,
}: StageStepperProps) {
  return (
    <div className="mx-auto max-w-sm space-y-2 text-left">
      {PIPELINE_STAGES.map(({ key, label }) => {
        const done = stagesDone.has(key);
        const active = !done && key === activeStage && !hasFailed;
        const failed = hasFailed && key === activeStage;
        return (
          <div key={key} className="flex items-center gap-2 text-xs">
            <span
              className={
                done
                  ? "text-green-600"
                  : failed
                    ? "text-destructive"
                    : active
                      ? "text-yellow-500"
                      : "text-muted-foreground/50"
              }
            >
              {done ? "[OK]" : failed ? "[FAIL]" : active ? "(...)" : "[ ]"}
            </span>
            <span
              className={done || active ? "font-medium text-foreground" : "text-muted-foreground"}
            >
              {label}
            </span>
            {done && stageTimes[key] !== undefined && (
              <span className="ml-auto text-[10px] font-mono text-muted-foreground">
                {stageTimes[key]}ms
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
