// Unified exports for @unweave/core
export { extract, extractMultiple } from "./extract.js";
export {
  normalizeViewport,
  EXTRACTION_LIMITS,
  extractCSSVariables,
  extractPageMeta,
  extractElements,
  extractImages,
} from "./extract-helpers.js";
export { analyze } from "./analyze.js";
export { generateSpec } from "./spec.js";
export { generate } from "./generate.js";
export { pipeline, pipelineFromReference } from "./pipeline.js";
export { saveReference, loadReference, listReferences } from "./references.js";
export { compare } from "./compare.js";

// Version
export const version = "0.1.0";
