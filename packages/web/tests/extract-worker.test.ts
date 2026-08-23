import { describe, it, expect, beforeEach, vi } from "vitest";

const h = vi.hoisted(() => ({
  postMessage: vi.fn(),
  pipeline: vi.fn(),
}));

vi.mock("worker_threads", () => ({
  parentPort: { postMessage: h.postMessage },
  workerData: { url: "https://example.com", options: { format: "html" } },
}));

vi.mock("@/lib/logger", () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
  addLogEntry: vi.fn(),
}));

vi.mock("@unweave/core/pipeline", () => ({ pipeline: h.pipeline }));

interface WorkerMessage {
  type: string;
  progress?: number;
  result?: unknown;
  error?: string;
}

/**
 * Returns worker messages excluding log entries.
 * @returns {WorkerMessage[]} Non-log worker messages.
 */
function nonLogMessages(): WorkerMessage[] {
  return h.postMessage.mock.calls
    .map((call) => call[0] as WorkerMessage)
    .filter((msg) => msg.type !== "log");
}

const flush = () => new Promise((resolve) => setTimeout(resolve, 25));

/**
 * Imports the worker module (executes run()) and flushes async work.
 * @returns {Promise<void>} Resolves when pending microtasks settle.
 */
async function runWorker(): Promise<void> {
  await import("../app/api/extract/extract-worker");
  await flush();
  await flush();
}

describe("Web: extract-worker", () => {
  beforeEach(() => {
    vi.resetModules();
    h.postMessage.mockClear();
    h.pipeline.mockReset();
  });

  it("emits no progress message before completion (pipeline owns progress)", async () => {
    h.pipeline.mockResolvedValue([{ success: true, extracted: {} }]);

    await runWorker();

    expect(nonLogMessages()).toEqual([
      { type: "completed", progress: 100, result: { success: true, extracted: {} } },
    ]);
  });

  it("posts failed message when pipeline reports unsuccessful result", async () => {
    h.pipeline.mockResolvedValue([{ success: false, error: "specTime is not defined" }]);

    await runWorker();

    const msgs = nonLogMessages();
    expect(msgs).toHaveLength(1);
    expect(msgs[0].type).toBe("failed");
    expect(msgs[0].error).toBe("specTime is not defined");
  });

  it("posts failed message when pipeline throws", async () => {
    h.pipeline.mockRejectedValue(new Error("boom"));

    await runWorker();

    const msgs = nonLogMessages();
    expect(msgs).toHaveLength(1);
    expect(msgs[0].type).toBe("failed");
    expect(msgs[0].error).toBe("boom");
  });
});
