/**
 * @file Helper functions for Playwright extraction - main exports
 */

export {
  normalizeViewport,
  EXTRACTION_LIMITS,
  extractCSSVariables,
  RELEVANT_CSS_PROPERTIES,
  SKIP_TAGS,
  isVisibleElement,
} from "./extract-css.js";

export { extractPageMeta, extractElements, extractImages } from "./extract-dom.js";

export { normalizeViewport, EXTRACTION_LIMITS } from "./extract-css.js";
