# Wizard Progress Visualization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Visualize extraction pipeline progress in the Extract Wizard via a 4-stage stepper, a job-scoped live log panel, and a post-completion timing summary.

**Architecture:** The worker protocol is unchanged. `route.ts` maps incoming progress-message text to a stage key, accumulates `{stage, at}` records into a new `Job.stages Json` column, and stamps every worker log entry with the jobId. `StepProgress.tsx` polls `/api/status` (stages) and `/api/logs?jobId=` (log lines) once per second and renders stepper + collapsible log panel + final timing summary.

**Tech Stack:** Next.js 16 App Router, React 19, Prisma 6 + SQLite, vitest 2 + Testing Library.

## Global Constraints

- Spec: `docs/superpowers/specs/2026-08-23-wizard-progress-visualization-design.md`
- UI copy in English; no emoji anywhere (STD-DOC-003)
- No changes to `packages/core` or worker protocol
- Auto-transition to result step exactly 2000 ms after completion
- Before the final commit, remove diagnostic markers: `[w-debug]` in extract-worker.ts, `[m-diag]` in route.ts, `[d-diag]` in jobStore.ts
- Commands run from `packages/web` unless stated otherwise

---

### Task 1: Stage mapping module (`lib/pipeline-stages.ts`)

**Files:**

- Create: `lib/pipeline-stages.ts`
- Test: `tests/pipeline-stages.test.ts`

**Interfaces:**

- Produces: `PIPELINE_STAGES: readonly {key: StageKey; label: string}[]`, `resolveStage(message: string): StageKey | null`, type `StageKey = "extract" | "analyze" | "spec" | "generate"`

- [ ] **Step 1: Write the failing test**

```ts
// tests/pipeline-stages.test.ts
import { describe, it, expect } from "vitest";
import { PIPELINE_STAGES, resolveStage } from "../lib/pipeline-stages";

describe("Web: pipeline-stages", () => {
  it("maps known pipeline messages to stage keys", () => {
    expect(resolveStage("Extracting components...")).toBe("extract");
    expect(resolveStage("Analyzing design system...")).toBe("analyze");
    expect(resolveStage("Generating specification...")).toBe("spec");
    expect(resolveStage("Generating code...")).toBe("generate");
  });

  it("returns null for unknown messages", () => {
    expect(resolveStage("Starting pipeline...")).toBeNull();
    expect(resolveStage("Extraction completed")).toBeNull();
    expect(resolveStage("")).toBeNull();
  });

  it("exposes four ordered stages with labels", () => {
    expect(PIPELINE_STAGES.map((s) => s.key)).toEqual(["extract", "analyze", "spec", "generate"]);
    expect(PIPELINE_STAGES.every((s) => s.label.length > 0)).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/pipeline-stages.test.ts`
Expected: FAIL — cannot resolve module `../lib/pipeline-stages`

- [ ] **Step 3: Write minimal implementation**

```ts
// lib/pipeline-stages.ts
/**
 * @file Pipeline stage definitions and progress-message-to-stage mapping.
 */

export type StageKey = "extract" | "analyze" | "spec" | "generate";

export interface StageRecord {
  stage: StageKey;
  at: string;
}

export interface StageDefinition {
  key: StageKey;
  label: string;
}

export const PIPELINE_STAGES: readonly StageDefinition[] = [
  { key: "extract", label: "Extract components" },
  { key: "analyze", label: "Analyze design system" },
  { key: "spec", label: "Generate specification" },
  { key: "generate", label: "Generate code" },
];

const PREFIX_MAP: ReadonlyArray<readonly [string, StageKey]> = [
  ["Generating specification", "spec"],
  ["Generating code", "generate"],
  ["Extracting", "extract"],
  ["Analyzing", "analyze"],
];

export function resolveStage(message: string): StageKey | null {
  if (!message) return null;
  const hit = PREFIX_MAP.find(([prefix]) => message.startsWith(prefix));
  return hit ? hit[1] : null;
}
```

(Longest prefixes first so `"Generating specification"` wins over a generic prefix.)

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/pipeline-stages.test.ts`
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add lib/pipeline-stages.ts tests/pipeline-stages.test.ts
git commit -m "feat(web): add pipeline stage mapping module"
```

---

### Task 2: jobId filter in logger (`lib/logger.ts`)

**Files:**

- Modify: `lib/logger.ts` (interface `LogEntry`, interface `GetLogsOptions`, function `getLogs`)
- Modify: `app/api/logs/route.ts` (GET handler: parse `jobId` query param)
- Test: `tests/logger.test.ts` (append one test)

**Interfaces:**

- Consumes: nothing new
- Produces: `LogEntry.jobId?: string`; `GetLogsOptions.jobId?: string`; `getLogs({jobId})` returns only entries whose `jobId` matches

- [ ] **Step 1: Add failing test**

Append inside the existing describe block of `tests/logger.test.ts`:

```ts
it("should filter logs by jobId", () => {
  clearLogs();
  addLogEntry({
    timestamp: new Date().toISOString(),
    level: "info",
    module: "Worker",
    message: "job A line",
    jobId: "job-a",
  });
  addLogEntry({
    timestamp: new Date().toISOString(),
    level: "info",
    module: "Worker",
    message: "no job line",
  });
  expect(getLogs({ jobId: "job-a" }).map((l) => l.message)).toEqual(["job A line"]);
});
```

If the file does not import them yet, extend its import from `../../lib/logger` to include `clearLogs` and `getLogs` alongside existing names (match what the file already imports).

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/logger.test.ts`
Expected: FAIL — TypeScript/property mismatch: `jobId` not part of `LogEntry` / unknown option

- [ ] **Step 3: Implement**

In `lib/logger.ts`:

Add optional field to `LogEntry` (after `data?: any;`):

```ts
  jobId?: string;
```

Add option to `GetLogsOptions` (after `module?: string;`):

```ts
  jobId?: string;
```

Inside `getLogs`, before the `limit` slice, add:

```ts
if (options?.jobId) {
  logs = logs.filter((l) => l.jobId === options.jobId);
}
```

Note: entries without `jobId` are excluded when filtering by jobId — this is intended, because untagged lines come from other modules.

Also in `app/api/logs/route.ts` GET handler, parse the param and pass it through:

```ts
const jobIdParam = searchParams.get("jobId");
const logs = getLogs({
  limit: Number.isNaN(limit) ? undefined : limit,
  level: levelParam || undefined,
  module: moduleParam || undefined,
  jobId: jobIdParam || undefined,
});
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/logger.test.ts`
Expected: PASS (all)

- [ ] **Step 5: Commit**

```bash
git add lib/logger.ts app/api/logs/route.ts tests/logger.test.ts
git commit -m "feat(web): support jobId filter in log store and logs API"
```

---

### Task 3: Prisma schema — `Job.stages`

**Files:**

- Modify: `prisma/schema.prisma` (model Job)
- Apply: database + regenerated client

**Interfaces:**

- Produces: `Job.stages` nullable JSON column; Prisma client type gains `stages?: Prisma.JsonValue | null`. Later tasks pass `stages` through `updateJob(id, { stages })`.

- [ ] **Step 1: Edit schema**

In `prisma/schema.prisma`, model `Job`, add after `result    Json?`:

```prisma
  stages    Json?
```

- [ ] **Step 2: Apply to local database and regenerate client**

Run: `pnpm --filter @unweave/web exec prisma db push`
Expected: `Your database is now in sync with your schema.` and `Generated Prisma Client`.

- [ ] **Step 3: Verify client type**

Run: `npx tsc --noEmit`
Expected: no new errors (baseline has pre-existing errors elsewhere; count must not increase).

- [ ] **Step 4: Commit**

```bash
git add prisma/schema.prisma
git commit -m "feat(web): add Job.stages JSON column for pipeline stage timeline"
```

---

### Task 4: Route integration — stages accumulation and log tagging (`app/api/extract/route.ts`)

**Files:**

- Modify: `app/api/extract/route.ts` (POST handler, worker.on("message") block)

**Interfaces:**

- Consumes: `resolveStage` from Task 1; `updateJob(id, updates)` accepts `stages` (Prisma passthrough from Task 3); `addLogEntry(entry)` accepts `entry.jobId` from Task 2
- Produces: `/api/status/{id}` responses include `stages` array; log entries carry `jobId`

- [ ] **Step 1: Add import**

At top of `route.ts` add:

```ts
import { resolveStage } from "@/lib/pipeline-stages";
```

- [ ] **Step 2: Accumulate stages and tag logs**

Replace the current `worker.on("message", ...)` block body between `try {` and its closing `catch` with:

```ts
let stages: Array<{ stage: string; at: string }> = [];
if (msg.type === "log" && msg.entry) {
  addLogEntry({ ...msg.entry, jobId });
} else if (msg.type === "progress") {
  const stage = resolveStage(msg.message ?? "");
  if (stage && (stages.length === 0 || stages[stages.length - 1].stage !== stage)) {
    stages = [...stages, { stage, at: new Date().toISOString() }];
  }
  await updateJob(jobId, {
    status: "processing",
    progress: msg.progress,
    message: msg.message,
    ...(stages.length > 0 ? { stages } : {}),
  });
} else if (msg.type === "completed") {
  await updateJob(jobId, {
    status: "completed",
    progress: 100,
    result: msg.result,
    message: "Extraction completed",
  });
} else if (msg.type === "failed") {
  await updateJob(jobId, { status: "failed", error: msg.error });
}
```

Important: `stages` is declared INSIDE the handler closure but must accumulate across messages — declare it BEFORE `worker.on("message", ...)` next to the other per-job state (right after `logger.info("API:Extract", \`Worker spawned...\`)`). Only the `if/else` chain shown above goes inside the handler. Final handler shape:

```ts
let stages: Array<{ stage: string; at: string }> = [];
// Listen to worker messages and update DB
worker.on("message", async (msg: any) => {
  try {
    if (msg.type === "log" && msg.entry) {
      addLogEntry({ ...msg.entry, jobId });
    } else if (msg.type === "progress") {
      const stage = resolveStage(msg.message ?? "");
      if (stage && (stages.length === 0 || stages[stages.length - 1].stage !== stage)) {
        stages = [...stages, { stage, at: new Date().toISOString() }];
      }
      await updateJob(jobId, {
        status: "processing",
        progress: msg.progress,
        message: msg.message,
        ...(stages.length > 0 ? { stages } : {}),
      });
    } else if (msg.type === "completed") {
      await updateJob(jobId, {
        status: "completed",
        progress: 100,
        result: msg.result,
        message: "Extraction completed",
      });
    } else if (msg.type === "failed") {
      await updateJob(jobId, { status: "failed", error: msg.error });
    }
  } catch (dbError) {
    logger.error("API:Extract", `Failed to update job ${jobId} from worker message`, dbError);
  }
});
```

- [ ] **Step 3: Manual verification against production server**

```bash
npm run build
```

Start server in background, then run one extraction with `component`+`format` and poll status until completed; verify response contains non-empty `stages` array whose keys appear in order extract → analyze → spec → generate:

```bash
$env:PORT=3000; npm run start
```

```pwsh
$body = @{ url="https://example.com"; options=@{ viewport="desktop"; component="Card"; format="html" } } | ConvertTo-Json -Depth 5
$id = (Invoke-RestMethod -Uri "http://localhost:3000/api/extract" -Method Post -ContentType "application/json" -Body $body).jobId
do { Start-Sleep -Seconds 2; $s = Invoke-RestMethod -Uri "http://localhost:3000/api/status/$id" } while ($s.status -eq "processing")
$s.stages | ConvertTo-Json -Compress
```

Expected: array ending with `{"stage":"generate",...}`; `status` = `completed`.
Stop the server afterwards (kill PID from port 3000).

- [ ] **Step 4: Commit**

```bash
git add app/api/extract/route.ts
git commit -m "feat(web): record pipeline stage timeline and tag worker logs with jobId"
```

---

### Task 5: StepProgress UI — stepper, log panel, summary

**Files:**

- Modify: `components/wizard/steps/StepProgress.tsx`
- Test: `tests/step-progress.test.tsx` (append tests)

**Interfaces:**

- Consumes: `GET /api/status/{id}` returning `{status, progress, message, stages?, result?}`;
  `GET /api/logs?jobId={id}&limit=30` returning array of `LogEntry`;
  `PIPELINE_STAGES`, `StageKey` from Task 1
- Produces: rendered stepper/log/summary; no exports consumed by other tasks

- [ ] **Step 1: Add failing component tests**

Append to `tests/step-progress.test.tsx` inside the existing describe:

```ts
it("renders stage stepper driven by status stages", async () => {
  globalThis.fetch = vi.fn(async (input: RequestInfo | URL) =>
    String(input).includes("/api/logs")
      ? ({ ok: true, json: async () => [] } as Response)
      : ({
          ok: true,
          json: async () => ({
            status: "processing",
            progress: 50,
            stages: [
              { stage: "extract", at: "2026-01-01T00:00:00Z" },
              { stage: "analyze", at: "2026-01-01T00:00:05Z" },
            ],
          }),
        } as Response),
  ) as unknown as typeof fetch;

  useWizardStore.setState({ url: "https://start.example", jobId: "job-123" });
  const view = renderInStrictMode();

  await waitFor(() => expect(view.getByText("Extract components")).toBeTruthy());
  expect(view.getByText("Analyze design system")).toBeTruthy();
  expect(view.getByText("Generate specification")).toBeTruthy();
  expect(view.getByText("Generate code")).toBeTruthy();
  view.unmount();
});

it("polls job-scoped worker log for the active job", async () => {
  const fetchMock = vi.fn(async (input: RequestInfo | URL) =>
    String(input).includes("/api/logs")
      ? ({
          ok: true,
          json: async () => [
            {
              timestamp: "2026-01-01T00:00:00Z",
              level: "info",
              module: "Worker",
              message: "line A",
              jobId: "job-123",
            },
          ],
        } as Response)
      : ({ ok: true, json: async () => ({ status: "processing", progress: 10 }) } as Response),
  );
  vi.stubGlobal("fetch", fetchMock);
  useWizardStore.setState({ url: "https://start.example", jobId: "job-123" });

  const view = renderInStrictMode();
  await waitFor(() => expect(view.getByText(/line A/)).toBeTruthy());

  const logCalls = fetchMock.mock.calls.filter(([u]) => String(u).includes("/api/logs"));
  expect(logCalls.length).toBeGreaterThan(0);
  expect(String(logCalls[0][0])).toContain("jobId=job-123");
  view.unmount();
});

it("shows timing summary on completion before auto-transition", async () => {
  vi.useFakeTimers();
  try {
    globalThis.fetch = vi.fn(async (input: RequestInfo | URL) =>
      String(input).includes("/api/logs")
        ? ({ ok: true, json: async () => [] } as Response)
        : ({
            ok: true,
            json: async () => ({
              status: "completed",
              progress: 100,
              result: {
                success: true,
                timing: { total: 3300, extract: 3100, analyze: 200, spec: 3, generate: 3 },
              },
            }),
          } as Response),
    ) as unknown as typeof fetch;

    useWizardStore.setState({ url: "https://start.example", jobId: "job-123" });
    const view = renderInStrictMode();

    await vi.advanceTimersByTimeAsync(500);
    expect(view.getByText(/Extract 3100ms|Extract 3\.1s/)).toBeTruthy();

    await vi.advanceTimersByTimeAsync(2100);
    expect(useWizardStore.getState().step).toBe("result");
  } finally {
    vi.useRealTimers();
  }
});
```

Note: the existing `beforeEach` stubs `fetch` with its own mock; tests above that define their own mock re-stub it explicitly — keep that order.

Also relax the completion transition in the component only after these tests exist (they drive the requirement).

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/step-progress.test.tsx`
Expected: 3 new tests FAIL (no stepper text, no /api/logs call, no timing summary / step stays "progress")

- [ ] **Step 3: Implement StepProgress**

Rewrite `components/wizard/steps/StepProgress.tsx` keeping the existing cancel flow, ref-guard effect, and abort logic intact:

```tsx
"use client";

import React, { useEffect, useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useWizardStore } from "@/store/wizard-store";
import { Loader2, XCircle, ChevronDown, ChevronUp } from "lucide-react";
import { PIPELINE_STAGES, StageKey } from "@/lib/pipeline-stages";

/**
 * @file StepProgress component: live extraction stepper, job-scoped log panel,
 * completion timing summary, and cancellation.
 */

interface StageEntry {
  stage: StageKey;
  at: string;
}

interface StatusPayload {
  status: string;
  progress: number;
  message?: string;
  error?: string;
  stages?: StageEntry[];
  result?: { timing?: Record<string, number> };
}

/**
 * Renders the extraction progress screen for the wizard.
 * @returns The rendered step content.
 */
export default function StepProgress() {
  const { url, jobId, setJobId, setStep, reset: resetWizard } = useWizardStore();
  const [progress, setProgress] = useState(10);
  const [message, setMessage] = useState("Initializing extraction worker...");
  const [isCancelling, setIsCancelling] = useState(false);
  const [stagesDone, setStagesDone] = useState<Set<StageKey>>(new Set());
  const [activeStage, setActiveStage] = useState<StageKey>("extract");
  const [stageTimes, setStageTimes] = useState<Partial<Record<StageKey, number>>>({});
  const [logLines, setLogLines] = useState<string[]>([]);
  const [showLog, setShowLog] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastStartedUrlRef = useRef<string | null>(null);
  const transitionedRef = useRef(false);

  const {
    mutate,
    reset,
    data: jobIdFromMutation,
  } = useMutation({
    mutationFn: async (targetUrl: string) => {
      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: targetUrl }),
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

  useEffect(() => {
    if (!url || lastStartedUrlRef.current === url) return;
    lastStartedUrlRef.current = url;
    mutate(url);
  }, [url, mutate]);

  const activeJobId = jobId ?? jobIdFromMutation;

  useEffect(() => {
    if (!activeJobId) return;
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const interval = setInterval(async () => {
      try {
        const statusRes = await fetch(`/api/status/${activeJobId}`, { signal: controller.signal });
        if (!statusRes.ok) return;
        const s: StatusPayload = await statusRes.json();
        setProgress(s.progress);
        if (s.message) setMessage(s.message);

        const doneStages = new Set<StageKey>();
        (s.stages ?? []).forEach((rec, i, arr) => {
          const nextAt = i + 1 < arr.length ? arr[i + 1].at : Date.now().toString();
          setStageTimes((prev) =>
            prev[rec.stage as StageKey] !== undefined
              ? prev
              : {
                  ...prev,
                  [rec.stage as StageKey]: Math.max(
                    new Date(nextAt).getTime() - new Date(rec.at).getTime(),
                    0,
                  ),
                },
          );
          if (i < arr.length - 1 || s.status !== "processing")
            doneStages.add(rec.stage as StageKey);
        });
        setStagesDone(doneStages);
        const lastRec = (s.stages ?? [])[Math.max((s.stages ?? []).length - 1, 0)];
        if (lastRec && s.status === "processing") setActiveStage(lastRec.stage as StageKey);

        const logRes = await fetch(`/api/logs?jobId=${activeJobId}&limit=30`);
        if (logRes.ok) {
          const entries = await logRes.json();
          setLogLines(
            entries.map(
              (e: { timestamp: string; level: string; message: string }) =>
                `${e.timestamp.slice(11, 19)} ${e.level.toUpperCase()} ${e.message}`,
            ),
          );
        }

        if (s.status === "completed") {
          clearInterval(interval);
          controller.abort();
          const t = s.result?.timing;
          if (t) {
            setSummary(
              `Extract ${t.extract ?? 0}ms · Analyze ${t.analyze ?? 0}ms · Spec ${t.spec ?? 0}ms · Generate ${t.generate ?? 0}ms · Total ${t.total ?? 0}ms`,
            );
          }
          setStagesDone(new Set(PIPELINE_STAGES.map((st) => st.key)));
          toast.success("Extraction completed successfully!");
          if (!transitionedRef.current) {
            transitionedRef.current = true;
            setTimeout(() => setStep("result"), 2000);
          }
        } else if (s.status === "failed") {
          clearInterval(interval);
          controller.abort();
          if (s.error !== "Cancelled by user") toast.error(s.error || "Extraction failed");
          setSummary(`Failed: ${s.error ?? "unknown error"}`);
        }
      } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") return;
      }
    }, 1000);

    return () => {
      clearInterval(interval);
      abortControllerRef.current?.abort();
    };
  }, [activeJobId, setStep]);

  const handleCancel = async () => {
    if (!activeJobId) return;
    setIsCancelling(true);
    try {
      abortControllerRef.current?.abort();
      await fetch(`/api/status/${activeJobId}`, { method: "DELETE" });
      toast.info("Extraction cancelled");
      resetWizard();
      setStep(1);
    } catch {
      toast.error("Failed to cancel extraction");
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="space-y-5 py-6 text-center">
      <div className="flex justify-center">
        <div className="rounded-full bg-primary/10 p-3 text-primary">
          <Loader2 className="h-7 w-7 animate-spin" />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-foreground">Extracting UI &amp; Tokens</h3>
        <p className="mt-1 text-xs text-muted-foreground">{summary ?? message}</p>
      </div>

      <div className="mx-auto max-w-sm space-y-2 text-left">
        {PIPELINE_STAGES.map(({ key, label }) => {
          const done = stagesDone.has(key);
          const active = !done && key === activeStage && !summary;
          const failed = Boolean(summary?.startsWith("Failed")) && key === activeStage;
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
                {done ? "✓" : failed ? "✕" : active ? "⟳" : "○"}
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

      <div className="space-y-1.5">
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
          <span>{url}</span>
          <span>{progress}%</span>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setShowLog((v) => !v)}
        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
      >
        {showLog ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        Worker Log {logLines.length > 0 && `(${logLines.length})`}
      </button>
      {showLog && (
        <div className="mx-auto max-w-md max-h-48 overflow-y-auto rounded-lg bg-zinc-950 p-3 text-left font-mono text-[11px] leading-relaxed text-zinc-300">
          {logLines.length === 0 && <div className="text-zinc-500">No log entries yet…</div>}
          {logLines.map((line, i) => (
            <div key={i}>{line}</div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={handleCancel}
        disabled={isCancelling}
        className="mt-4 inline-flex items-center justify-center gap-1.5 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-2 text-xs font-medium text-destructive hover:bg-destructive/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <XCircle className="h-3.5 w-3.5" />
        {isCancelling ? "Cancelling..." : "Cancel Extraction"}
      </button>
    </div>
  );
}
```

Keep the previous behavior of the old mutation body (options payload) ONLY where still required by API contract — the wizard previously sent full options; preserve that request body exactly as it exists today (copy it from the current file rather than the shortened version above if they differ). The shortened body above must NOT replace richer options silently: diff before saving.

- [ ] **Step 4: Run component tests**

Run: `npx vitest run tests/step-progress.test.tsx`
Expected: PASS (all, including 3 new ones)

If the timing-summary test fails because `setStep` fires early, guard the transition timer with `transitionedRef` (already included) and ensure the interval callback checks `s.status === "completed"` before scheduling.

- [ ] **Step 5: Run full web test suite**

Run: `npm test`
Expected: all files pass

- [ ] **Step 6: Commit**

```bash
git add components/wizard/steps/StepProgress.tsx tests/step-progress.test.tsx
git commit -m "feat(web): visualize extraction stages, live job log, and timing summary in wizard"
```

---

### Task 6: Remove diagnostic instrumentation

**Files:**

- Modify: `app/api/extract/extract-worker.ts` (remove `[w-debug]` console.error blocks)
- Modify: `app/api/extract/route.ts` (remove `[m-diag]` console.error lines)
- Modify: `lib/jobStore.ts` (remove `[d-diag]` logger.info/error lines added during investigation)

**Interfaces:**

- Consumes/Produces: none — pure cleanup, zero behavioral change

- [ ] **Step 1: Delete marker lines**

Remove every statement containing the markers below (keep surrounding code):

- In `extract-worker.ts`: three `console.error("[w-debug] …")` statements and their `// eslint-disable-next-line no-console` comments
- In `route.ts`: two `console.error("[m-diag] …")` statements and their disable comments
- In `jobStore.ts`: the `[d-diag] updateJob OK/FAIL` logger statements (keep original `Updating job` / `updated successfully` / `Failed to update job` logs)

- [ ] **Step 2: Verify grep is clean**

Run: `rg -n "w-debug|m-diag|d-diag" app lib`
Expected: no output

- [ ] **Step 3: Run full verification**

Run: `npm test` then `npx tsc --noEmit` then `npx eslint . --max-warnings=0` (fix any NEW issues introduced by this feature; pre-existing warnings outside touched files are out of scope)

- [ ] **Step 4: Commit**

```bash
git add app/api/extract/extract-worker.ts app/api/extract/route.ts lib/jobStore.ts
git commit -m "chore(web): remove temporary pipeline diagnostics"
```

---

### Task 7: End-to-end verification on heavy target

**Files:** none (verification only)

- [ ] **Step 1: Production build and start**

```bash
npm run build
```

Start `npm run start` in background; wait for HTTP 200 on `http://localhost:3000`.

- [ ] **Step 2: Heavy scenario via API**

Extraction on `https://linear.app` with all phases enabled, screenshots fullPage+viewport, `component="LinearLanding"`, `format="react"`; poll `/api/status/{id}` until terminal state.

Expected: `status=completed`, `stages` contains extract→analyze→spec→generate in order, `result.generated` has `.tsx/.css/.stories.tsx` files.

- [ ] **Step 3: UI walkthrough**

Open `http://localhost:3000`, launch the wizard with the same inputs:

- Stepper advances through 4 stages, timings appear next to finished stages
- Log panel shows worker lines scoped to this job only
- On completion: green stepper + timing line, then automatic switch to results
- Cancel flow on a second run: red failure indicator, panel accessible

- [ ] **Step 4: Stop server, report**

Kill the background server. Report observed timings and any deviations from spec.
