import { describe, it, expect, beforeEach } from "vitest";
import { rmSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  saveJobScreenshots,
  listJobScreenshots,
  readJobScreenshot,
  isSafeScreenshotName,
} from "../lib/screenshot-store";

describe("Web: screenshot-store", () => {
  const baseDir = mkdtempSync(join(tmpdir(), "unweave-shots-"));
  const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x01, 0x02]);

  beforeEach(() => {
    rmSync(baseDir, { recursive: true, force: true });
    mkdtempSync(baseDir);
  });

  it("saves screenshot buffers to disk and lists them", async () => {
    const saved = await saveJobScreenshots("job-1", { full: png, viewport: png }, baseDir);
    expect(saved.sort()).toEqual(["full", "viewport"]);
    expect(await listJobScreenshots("job-1", baseDir)).toEqual(["full", "viewport"]);
  });

  it("round-trips file content", async () => {
    await saveJobScreenshots("job-1", { full: png }, baseDir);
    expect(await readJobScreenshot("job-1", "full", baseDir)).toEqual(png);
  });

  it("returns empty results when nothing was captured or saved", async () => {
    expect(await saveJobScreenshots("job-1", undefined, baseDir)).toEqual([]);
    await saveJobScreenshots("job-1", { full: png }, baseDir);
    expect(await listJobScreenshots("job-unknown", baseDir)).toEqual([]);
    expect(await readJobScreenshot("job-1", "mobile", baseDir)).toBeNull();
  });

  it("rejects unsafe names to prevent path traversal", () => {
    expect(isSafeScreenshotName("full")).toBe(true);
    expect(isSafeScreenshotName("..\\evil")).toBe(false);
    expect(isSafeScreenshotName("../evil")).toBe(false);
    expect(isSafeScreenshotName("a/b")).toBe(false);
  });

  it("refuses traversal jobIds when listing", async () => {
    expect(await listJobScreenshots("../..", baseDir)).toEqual([]);
    expect(await listJobScreenshots("a/b", baseDir)).toEqual([]);
  });

  it("accepts plain Uint8Array (postMessage strips Buffer class)", async () => {
    const saved = await saveJobScreenshots("job-2", { full: new Uint8Array(png) }, baseDir);
    expect(saved).toEqual(["full"]);
    expect(await readJobScreenshot("job-2", "full", baseDir)).toEqual(png);
  });
});
