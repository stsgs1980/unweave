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
});
