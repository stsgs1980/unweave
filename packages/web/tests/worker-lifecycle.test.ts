import { describe, it, expect, vi } from "vitest";
import {
  createWorkerMessageHandler,
  createWorkerExitHandler,
  WorkerLifecycleState,
} from "@/lib/worker-lifecycle";
import { logger } from "@/lib/logger";

/**
 * Builds the worker lifecycle dependency set with vi.fn() defaults.
 * @param overrides - Dependency overrides for a specific test case.
 * @returns The dependency object.
 */
function makeDeps(overrides: Record<string, unknown> = {}) {
  return {
    saveScreenshots: vi.fn().mockResolvedValue([]),
    updateJob: vi.fn().mockResolvedValue(undefined),
    getJob: vi.fn().mockResolvedValue(undefined),
    unregister: vi.fn(),
    isCancelled: vi.fn(() => false),
    log: logger,
    ...overrides,
  };
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

describe("worker-lifecycle message handler", () => {
  it("sets terminal flag synchronously before awaiting screenshot saving", async () => {
    const state = new WorkerLifecycleState();
    const deps = makeDeps({
      saveScreenshots: vi.fn(async () => {
        await sleep(20);
        return [];
      }),
    });
    const onMessage = createWorkerMessageHandler("job-1", state, deps);

    const completedMsg = { type: "completed", progress: 100, result: { ok: true } };
    const handling = onMessage(completedMsg);

    expect(state.terminalStatusSent).toBe(true);
    expect(state.lastMessage).toBe("completed");

    await handling;
    expect(deps.updateJob).toHaveBeenCalledWith(
      "job-1",
      expect.objectContaining({ status: "completed", error: null }),
    );
  });

  it("marks processing updates and tracks last message", async () => {
    const state = new WorkerLifecycleState();
    const deps = makeDeps();
    const onMessage = createWorkerMessageHandler("job-1", state, deps);

    await onMessage({ type: "progress", progress: 40, message: "Analyzing design system..." });

    expect(state.terminalStatusSent).toBe(false);
    expect(state.lastMessage).toBe("progress 40%");
    expect(deps.updateJob).toHaveBeenCalledWith(
      "job-1",
      expect.objectContaining({ status: "processing", progress: 40 }),
    );
  });

  it("drops messages for cancelled jobs without touching db", async () => {
    const state = new WorkerLifecycleState();
    state.cancelled = true;
    const deps = makeDeps();
    const onMessage = createWorkerMessageHandler("job-1", state, deps);

    await onMessage({ type: "progress", progress: 10, message: "Extracting components..." });

    expect(deps.updateJob).not.toHaveBeenCalled();
  });
});

describe("worker-lifecycle exit handler", () => {
  it("skips when terminal status was already sent", async () => {
    const state = new WorkerLifecycleState();
    state.terminalStatusSent = true;
    const deps = makeDeps();
    const onExit = createWorkerExitHandler("job-1", state, deps);

    await onExit(0);

    expect(deps.getJob).not.toHaveBeenCalled();
    expect(deps.updateJob).not.toHaveBeenCalled();
    expect(deps.unregister).toHaveBeenCalled();
  });

  it("skips when db already holds a terminal status", async () => {
    const state = new WorkerLifecycleState();
    const deps = makeDeps({ getJob: vi.fn().mockResolvedValue({ status: "completed" }) });
    const onExit = createWorkerExitHandler("job-1", state, deps);

    await onExit(0);

    expect(deps.updateJob).not.toHaveBeenCalled();
  });

  it("marks job failed with diagnostics on silent zero-code exit", async () => {
    const state = new WorkerLifecycleState();
    state.lastMessage = "progress 60%";
    const deps = makeDeps({ getJob: vi.fn().mockResolvedValue({ status: "processing" }) });
    const onExit = createWorkerExitHandler("job-1", state, deps);

    await onExit(0);

    expect(deps.updateJob).toHaveBeenCalledWith(
      "job-1",
      expect.objectContaining({
        status: "failed",
        error: expect.stringContaining("progress 60%"),
      }),
    );
  });

  it("marks job failed on non-zero exit code", async () => {
    const state = new WorkerLifecycleState();
    const deps = makeDeps({ getJob: vi.fn().mockResolvedValue({ status: "processing" }) });
    const onExit = createWorkerExitHandler("job-1", state, deps);

    await onExit(1);

    expect(deps.updateJob).toHaveBeenCalledWith(
      "job-1",
      expect.objectContaining({
        status: "failed",
        error: expect.stringContaining("exit code 1"),
      }),
    );
  });

  it("skips cancelled jobs", async () => {
    const state = new WorkerLifecycleState();
    state.cancelled = true;
    const deps = makeDeps({ getJob: vi.fn().mockResolvedValue({ status: "processing" }) });
    const onExit = createWorkerExitHandler("job-1", state, deps);

    await onExit(1);

    expect(deps.updateJob).not.toHaveBeenCalled();
  });
});
