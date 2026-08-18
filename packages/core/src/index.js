// Unified exports for @ui-extractor/core
export { extract, extractMultiple } from './extract.js';
export { analyze } from './analyze.js';
export { generateSpec } from './spec.js';
export { generate } from './generate.js';
export {
  pipeline,
  pipelineFromReference,
  saveReference,
  loadReference,
  listReferences,
  compare,
} from './pipeline.js';

// Version
export const version = '0.1.0';
