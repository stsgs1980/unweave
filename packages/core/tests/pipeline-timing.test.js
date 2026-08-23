import { describe, it, expect, vi } from "vitest";

vi.mock("../src/extract.js", () => ({
  extract: vi.fn().mockResolvedValue({ cssVariables: {}, elements: [], images: [] }),
  extractMultiple: vi.fn(),
}));
vi.mock("../src/analyze.js", () => ({
  analyze: vi.fn(() => ({ designSystem: {}, components: [], patterns: [] })),
}));
vi.mock("../src/spec.js", () => ({ generateSpec: vi.fn(() => ({})) }));
vi.mock("../src/generate.js", () => ({ generate: vi.fn(() => "") }));
vi.mock("../src/diff.js", () => ({
  diffDesignSystems: vi.fn(),
  diffComponents: vi.fn(),
  diffPatterns: vi.fn(),
}));

import { pipeline } from "../src/pipeline.js";

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
});
