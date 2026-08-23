/**
 * @file Disk persistence for job screenshots captured by the extraction pipeline.
 */

import { mkdir, writeFile, readFile, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const DEFAULT_BASE_DIR = path.join(process.cwd(), ".data", "screenshots");
const NAME_PATTERN = /^[a-zA-Z0-9_-]+$/;

/**
 * Resolves the storage directory for a job's screenshots.
 * @param {string} jobId - The extraction job ID.
 * @param {string} baseDir - Storage root directory.
 * @returns {string} Absolute path to the job screenshot folder.
 */
function jobDir(jobId: string, baseDir: string): string {
  return path.join(baseDir, jobId);
}

/**
 * Validates a screenshot name to prevent path traversal.
 * @param {string} name - Screenshot type or file name.
 * @returns {boolean} True when the name is safe.
 */
export function isSafeScreenshotName(name: string): boolean {
  return NAME_PATTERN.test(name);
}

/**
 * Persists screenshot buffers for a job as PNG files on disk.
 * @param {string} jobId - The extraction job ID.
 * @param {Record<string, Uint8Array>} [screenshots] - Map of screenshot type to PNG data.
 * @param {string} [baseDir] - Storage root override (used by tests).
 * @returns {Promise<string[]>} Names of successfully saved screenshots.
 */
export async function saveJobScreenshots(
  jobId: string,
  screenshots?: Record<string, Uint8Array>,
  baseDir: string = DEFAULT_BASE_DIR,
): Promise<string[]> {
  if (!screenshots || typeof screenshots !== "object") return [];
  const saved: string[] = [];
  for (const [name, buffer] of Object.entries(screenshots)) {
    if (!isSafeScreenshotName(name) || !(buffer instanceof Uint8Array)) continue;
    const dir = jobDir(jobId, baseDir);
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, `${name}.png`), buffer);
    saved.push(name);
  }
  return saved.sort();
}

/**
 * Lists screenshot names previously saved for a job.
 * @param {string} jobId - The extraction job ID.
 * @param {string} [baseDir] - Storage root override (used by tests).
 * @returns {string[]} Sorted screenshot names (without extension).
 */
export async function listJobScreenshots(
  jobId: string,
  baseDir: string = DEFAULT_BASE_DIR,
): Promise<string[]> {
  const dir = jobDir(jobId, baseDir);
  if (!existsSync(dir)) return [];
  const files = await readdir(dir);
  return files
    .filter((f) => f.endsWith(".png"))
    .map((f) => f.slice(0, -4))
    .sort();
}

/**
 * Reads a saved screenshot file.
 * @param {string} jobId - The extraction job ID.
 * @param {string} name - Screenshot name without extension.
 * @param {string} [baseDir] - Storage root override (used by tests).
 * @returns {Promise<Buffer|null>} PNG bytes, or null when missing or unsafe name.
 */
export async function readJobScreenshot(
  jobId: string,
  name: string,
  baseDir: string = DEFAULT_BASE_DIR,
): Promise<Buffer | null> {
  if (!isSafeScreenshotName(name) || !isSafeScreenshotName(jobId)) return null;
  try {
    return await readFile(path.join(jobDir(jobId, baseDir), `${name}.png`));
  } catch {
    return null;
  }
}
