/**
 * @file CSS extraction helpers for Playwright
 */

import { chromium } from "playwright";

/**
 * Default limits for extraction
 * @type {Object}
 */
export const EXTRACTION_LIMITS = {
  maxElements: 500,
  evaluateTimeout: 30000,
};

/**
 * Only extract relevant CSS properties for UI extraction - avoids 2000+ properties
 * @type {string[]}
 */
export const RELEVANT_CSS_PROPERTIES = [
  // Layout
  "display",
  "position",
  "top",
  "right",
  "bottom",
  "left",
  "z-index",
  "flex",
  "flex-direction",
  "flex-wrap",
  "flex-grow",
  "flex-shrink",
  "flex-basis",
  "justify-content",
  "align-items",
  "align-content",
  "gap",
  "grid",
  "grid-template-columns",
  "grid-template-rows",
  "grid-gap",
  "float",
  "clear",
  // Box model
  "width",
  "height",
  "min-width",
  "min-height",
  "max-width",
  "max-height",
  "margin",
  "margin-top",
  "margin-right",
  "margin-bottom",
  "margin-left",
  "padding",
  "padding-top",
  "padding-right",
  "padding-bottom",
  "padding-left",
  "box-sizing",
  "overflow",
  "overflow-x",
  "overflow-y",
  // Borders
  "border",
  "border-width",
  "border-style",
  "border-color",
  "border-top",
  "border-right",
  "border-bottom",
  "border-left",
  "border-radius",
  "border-top-left-radius",
  "border-top-right-radius",
  "border-bottom-right-radius",
  "border-bottom-left-radius",
  // Background
  "background",
  "background-color",
  "background-image",
  "background-size",
  "background-position",
  "background-repeat",
  "background-origin",
  "background-clip",
  // Typography
  "color",
  "font",
  "font-family",
  "font-size",
  "font-weight",
  "font-style",
  "font-variant",
  "line-height",
  "letter-spacing",
  "text-align",
  "text-decoration",
  "text-transform",
  "white-space",
  "word-wrap",
  "word-break",
  "overflow-wrap",
  "text-overflow",
  "vertical-align",
  // Visual effects
  "opacity",
  "visibility",
  "filter",
  "backdrop-filter",
  "mix-blend-mode",
  "box-shadow",
  "text-shadow",
  // Transitions/Animations
  "transition",
  "transition-property",
  "transition-duration",
  "transition-timing-function",
  "transition-delay",
  "animation",
  "animation-name",
  "animation-duration",
  "animation-timing-function",
  "animation-delay",
  // Cursor/Interaction
  "cursor",
  "pointer-events",
  "user-select",
  // SVG
  "fill",
  "stroke",
  "stroke-width",
  "stroke-linecap",
  "stroke-linejoin",
];

/**
 * Extract CSS variables from documentElement
 * @param {Page} page - Playwright page
 * @returns {Promise<Object<string, string>>}
 */
export async function extractCSSVariables(page) {
  return page.evaluate(
    () => {
      const variables = {};
      const styles = window.getComputedStyle(document.documentElement);
      for (const [key, value] of Object.entries(styles)) {
        if (key.startsWith("--")) {
          variables[key] = typeof value === "string" ? value.trim() : "";
        }
      }
      return variables;
    },
    { timeout: EXTRACTION_LIMITS.evaluateTimeout },
  );
}

/**
 * Normalizes viewport options into Playwright width/height object.
 * @param {string|Object} [viewport] - Viewport mode name or dimensions object
 * @returns {{width: number, height: number}}
 */
export function normalizeViewport(viewport) {
  if (!viewport) return { width: 1280, height: 720 };
  if (typeof viewport === "object" && viewport.width && viewport.height) {
    return { width: Number(viewport.width), height: Number(viewport.height) };
  }
  if (typeof viewport === "string") {
    const v = viewport.toLowerCase().trim();
    if (v === "mobile") return { width: 375, height: 667 };
    if (v === "tablet") return { width: 768, height: 1024 };
    if (v === "desktop") return { width: 1280, height: 720 };
    if (v.includes("x")) {
      const parts = v.split("x").map(Number);
      if (parts[0] && parts[1]) return { width: parts[0], height: parts[1] };
    }
  }
  return { width: 1280, height: 720 };
}
