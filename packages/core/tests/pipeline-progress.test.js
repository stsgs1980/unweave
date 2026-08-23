import { describe, it, expect, vi } from "vitest";

vi.mock("../src/extract.js", () => ({
  extract: vi.fn(async (url, options) => {
    if (options.onProgress) {
      options.onProgress(0.4, "Extracting components... page loaded");
      options.onProgress(1, "Extracting components... capturing screenshot 2/2");
    }
    return { cssVariables: {}, elements: [], images: [] };
  }),
  extractMultiple: vi.fn(),
}));
vi.mock("../src/analyze.js", () => ({
  analyze: vi.fn(() => ({ designSystem: {}, components: [], patterns: [] })),
}));
vi.mock("../src/spec.js", () => ({ generateSpec: vi.fn(() => ({ name: "X" })) }));
vi.mock("../src/generate.js", () => ({ generate: vi.fn(() => "<div/>") }));
vi.mock("../src/diff.js", () => ({
  diffDesignSystems: vi.fn(),
  diffComponents: vi.fn(),
  diffPatterns: vi.fn(),
}));

import { pipeline } from "../src/pipeline.js";
import { extract } from "../src/extract.js";

describe("Core: pipeline granular progress", () => {
  it("maps extract sub-steps into the 5..35 percent range", async () => {
    const events = [];
    await pipeline("https://example.com", { component: "Button", format: "html" }, (p, m) =>
      events.push([p, m]),
    );

    const extractSubs = events.filter(([p]) => p > 5 && p < 36);
    expect(extractSubs).toContainEqual([17, "Extracting components... page loaded"]);
    expect(extractSubs).toContainEqual([35, "Extracting components... capturing screenshot 2/2"]);
  });

  it("keeps progress monotonic and ends at exactly 100", async () => {
    const events = [];
    await pipeline("https://example.com", { component: "Button", format: "html" }, (p, m) =>
      events.push([p, m]),
    );

    const percents = events.map(([p]) => p);
    for (let i = 1; i < percents.length; i++) {
      expect(percents[i]).toBeGreaterThanOrEqual(percents[i - 1]);
    }
    expect(percents[percents.length - 1]).toBe(100);
  });

  it("forwards an onProgress function to extract only when provided", async () => {
    extract.mockClear();
    await pipeline("https://example.com", {});
    expect(typeof extract.mock.calls[0][1].onProgress).toBe("undefined");

    extract.mockClear();
    await pipeline("https://example.com", {}, () => {});
    expect(typeof extract.mock.calls[0][1].onProgress).toBe("function");
  });
});
