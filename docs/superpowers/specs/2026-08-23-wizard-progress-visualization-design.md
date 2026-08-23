# Design: Extract Wizard Progress Visualization

- **Date:** 2026-08-23
- **Status:** Approved
- **Scope:** packages/web (route.ts, schema.prisma, logger.ts, StepProgress.tsx), no core changes

## Goal

Visualize extraction pipeline progress inside the Extract Wizard: a 4-stage stepper
with per-stage timing, a collapsible live worker-log panel scoped to the current job,
and a final timing summary shown briefly after successful completion.

## UX (validated via visual mockups)

1. **Stepper** replaces the bare percentage during extraction:
   - Stages: `Extract components` → `Analyze design system` → `Generate specification` → `Generate code`
   - States per stage: done (green check + duration), active (spinner), pending (gray)
2. **Live log panel**: collapsible ("▼ Worker Log"), dark console style, auto-scroll,
   polls `/api/logs?jobId=…&limit=30` once per second alongside the existing status poll.
3. **Completion summary**: all stages green + one line of phase timings from
   `result.timing` (e.g. `Extract 3.1s · Analyze 0.2s · Spec 3ms · Generate 3ms`),
   auto-transition to the result step after 2 seconds.
4. **Failure**: current stage turns red, error text is shown, log panel stays available
   for diagnosis.

Labels stay in English for consistency with existing wizard copy.

## Data flow

```
Worker (pipeline onProgress/onLog)
  └─ postMessage {type:"progress", message}      ──> route.ts maps message → stage key,
  │                                                  appends {stage, at} to Job.stages on change
  └─ postMessage {type:"log", entry}             ──> route.ts enriches entry with jobId,
                                                     addLogEntry() into shared log buffer
StepProgress.tsx polls every 1s:
  ├─ GET /api/status/{id}   → progress, stages[]
  └─ GET /api/logs?jobId=…  → filtered worker lines
```

Stage mapping (message prefix → key), protected by a unit test:

| Message starts with        | Stage      |
| -------------------------- | ---------- |
| `Extracting`               | `extract`  |
| `Analyzing`                | `analyze`  |
| `Generating specification` | `spec`     |
| `Generating code`          | `generate` |

Unknown messages leave the current stage unchanged. Progress `100%` / completed status
marks all stages done.

## Changes by layer

| Layer                                      | Change                                                                 |
| ------------------------------------------ | ---------------------------------------------------------------------- |
| `app/api/extract/route.ts`                 | Stage mapping + stages accumulation + enrich log entries with jobId    |
| `prisma/schema.prisma`                     | Add `Job.stages Json?`; apply via `pnpm --filter @unweave/web db:push` |
| `lib/logger.ts` (`getLogs`)                | Support `jobId` filter option                                          |
| `components/wizard/steps/StepProgress.tsx` | Stepper, log panel, completion summary, failure state                  |
| `lib/jobStore.ts`                          | No signature change — `stages` flows through `Partial<Job>` updates    |

No changes to `packages/core` or the worker protocol: the pipeline keeps emitting
progress text messages; stage resolution happens server-side in the route.

## Error handling

- Unknown/unmapped progress text: keep last known stage.
- Job cancelled/crashed mid-stage: failed state renders red on the active stage;
  log panel remains accessible.
- Log endpoint unavailable: panel shows "log unavailable" placeholder; extraction
  continues unaffected.

## Testing

- Unit test: message→stage mapping function (all four prefixes, unknown input).
- Extend `step-progress.test.tsx`: stepper renders stages from `stages[]`;
  log panel requests `/api/logs` with `jobId`.
- Manual E2E: heavy run against linear.app in production mode; verify stepper
  transitions, log scoping, completion summary, cancel/failure rendering.

## Cleanup

Diagnostic instrumentation added during investigation (`w-debug`, `m-diag`, `[d-diag]`
console markers in extract-worker.ts / route.ts / jobStore.ts) is removed before the
implementation commit.
