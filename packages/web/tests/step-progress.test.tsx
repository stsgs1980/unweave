// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, cleanup, waitFor } from "@testing-library/react";
import { StrictMode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import StepProgress from "@/components/wizard/steps/StepProgress";
import { useWizardStore } from "@/store/wizard-store";

vi.mock("sonner", () => ({
  toast: { error: vi.fn(), success: vi.fn(), info: vi.fn() },
}));

const flush = () => new Promise((resolve) => setTimeout(resolve, 25));

/**
 * Counts fetch calls to the extraction endpoint.
 * @returns {number} Number of POST /api/extract calls.
 */
function extractCallCount(): number {
  return (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls.filter(([url]) =>
    String(url).includes("/api/extract"),
  ).length;
}

/**
 * Creates a fetch mock resolving extraction and status endpoints.
 * @returns {ReturnType<typeof vi.fn>} Mocked fetch implementation.
 */
function makeFetchMock() {
  return vi.fn(async (input: RequestInfo | URL) => ({
    ok: true,
    json: async () =>
      String(input).includes("/api/extract")
        ? { jobId: "job-123" }
        : { status: "processing", progress: 42, message: "Working" },
  }));
}

/**
 * Renders StepProgress inside StrictMode and a QueryClientProvider.
 * @returns {ReturnType<typeof render>} Render result.
 */
function renderInStrictMode() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <StepProgress />
      </QueryClientProvider>
    </StrictMode>,
  );
}

describe("Web: StepProgress extraction request", () => {
  let originalFetch: typeof globalThis.fetch;

  beforeEach(() => {
    originalFetch = globalThis.fetch;
    vi.stubGlobal("fetch", makeFetchMock());
    useWizardStore.setState({ url: "https://start.example", jobId: null });
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    globalThis.fetch = originalFetch;
    useWizardStore.setState({ url: "https://linear.app", jobId: null });
  });

  it("sends exactly one extraction request under StrictMode double-effect", async () => {
    renderInStrictMode();

    await waitFor(() => expect(extractCallCount()).toBe(1));
    await flush();

    expect(extractCallCount()).toBe(1);
  });

  it("does not send another request on rerender with the same url", async () => {
    const view = renderInStrictMode();

    await waitFor(() => expect(extractCallCount()).toBe(1));
    view.rerender(
      <StrictMode>
        <QueryClientProvider client={new QueryClient()}>
          <StepProgress />
        </QueryClientProvider>
      </StrictMode>,
    );
    await flush();

    expect(extractCallCount()).toBe(1);
  });

  it("sends a new request when url changes", async () => {
    renderInStrictMode();

    await waitFor(() => expect(extractCallCount()).toBe(1));

    useWizardStore.setState({ url: "https://other.example" });

    await waitFor(() => expect(extractCallCount()).toBe(2));
  });

  it("renders cancel button and current url", () => {
    const view = renderInStrictMode();

    expect(view.getByRole("button", { name: /cancel extraction/i })).toBeTruthy();
    expect(view.getByText("https://start.example")).toBeTruthy();
  });

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
});
