/**
 * @file Pipeline stage definitions and progress-message-to-stage mapping.
 */

export type StageKey = "extract" | "analyze" | "spec" | "generate";

export interface StageRecord {
  stage: StageKey;
  at: string;
}

export interface StageDefinition {
  key: StageKey;
  label: string;
}

export const PIPELINE_STAGES: readonly StageDefinition[] = [
  { key: "extract", label: "Extract components" },
  { key: "analyze", label: "Analyze design system" },
  { key: "spec", label: "Generate specification" },
  { key: "generate", label: "Generate code" },
];

const PREFIX_MAP: ReadonlyArray<readonly [string, StageKey]> = [
  ["Generating specification", "spec"],
  ["Generating code", "generate"],
  ["Extracting", "extract"],
  ["Analyzing", "analyze"],
];

/**
 * Maps a worker progress message to its pipeline stage key.
 * @param {string} message - The progress message emitted by the pipeline.
 * @returns The matching stage key, or null when the message is unmapped.
 */
export function resolveStage(message: string): StageKey | null {
  if (!message) return null;
  const hit = PREFIX_MAP.find(([prefix]) => message.startsWith(prefix));
  return hit ? hit[1] : null;
}
