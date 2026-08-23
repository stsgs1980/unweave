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
