import { describe, it, expect, vi } from "vitest";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const busyWait = (ms) => {
  const start = Date.now();
  while (Date.now() - start < ms) {}
};

vi.mock("../src/extract.js", () => ({
  extract: vi.fn().mockResolvedValue({ cssVariables: {}, elements: [], images: [] }),
  extractMultiple: vi.fn(),
}));
vi.mock("../src/analyze.js", () => ({
  analyze: vi.fn(() => ({ designSystem: {}, components: [], patterns: [] })),
}));
vi.mock("../src/spec.js", () => ({
  generateSpec: vi.fn(() => {
    busyWait(20);
    return {};
  }),
}));
vi.mock("../src/generate.js", () => ({
  generate: vi.fn(() => {
    busyWait(20);
    return "";
  }),
}));
vi.mock("../src/diff.js", () => ({
  diffDesignSystems: vi.fn(),
  diffComponents: vi.fn(),
  diffPatterns: vi.fn(),
}));

import { pipeline } from "../src/pipeline.js";
import { extract } from "../src/extract.js";
import { saveReference, loadReference } from "../src/pipeline.js";

describe("Core: pipeline timing", () => {
  it("succeeds when spec/generate/learn phases are skipped", async () => {
    const results = await pipeline("https://example.com", {});

    expect(results[0].success).toBe(true);
    expect(results[0].error).toBeUndefined();
  });

  it("reports monotonic progress starting at 0", async () => {
    const updates = [];
    await pipeline("https://example.com", {}, (progress) => updates.push(progress));

    expect(updates[0]).toBe(0);
    expect([...updates].sort((a, b) => a - b)).toEqual(updates);
  });

  it("fills timing with zeros for skipped phases", async () => {
    const results = await pipeline("https://example.com", {});
    const timing = results[0].timing;

    expect(timing.spec).toBe(0);
    expect(timing.generate).toBe(0);
    expect(timing.reference).toBe(0);
    expect(timing.total).toEqual(expect.any(Number));
    expect(timing.extract).toEqual(expect.any(Number));
    expect(timing.analyze).toEqual(expect.any(Number));
  });

  it("measures non-zero timing when optional phases actually run", async () => {
    extract.mockImplementation(async () => {
      await delay(30);
      return { cssVariables: {}, elements: [], images: [] };
    });

    const refName = `test-ref-timing-${Date.now()}`;
    const results = await pipeline("https://example.com", {
      component: "Button",
      format: "html",
      learn: refName,
    });
    const timing = results[0].timing;

    try {
      expect(timing.spec).toBeGreaterThan(0);
      expect(timing.generate).toBeGreaterThan(0);
      expect(timing.reference).toBeGreaterThan(0);
    } finally {
      await loadReference(refName).then(() =>
        import("fs/promises").then((fs) => fs.rm(`references/${refName}.json`, { force: true })),
      );
    }
  });

  it("forwards screenshots option to extract", async () => {
    extract.mockResolvedValue({ cssVariables: {}, elements: [], images: [] });

    const screenshots = { fullPage: true, viewport: true, mobile: false, sections: false };
    await pipeline("https://example.com", { screenshots });

    expect(extract).toHaveBeenCalledWith(
      "https://example.com",
      expect.objectContaining({ screenshots }),
    );
  });
});
