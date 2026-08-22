/**
 * @file Skip tags and visibility checks for DOM extraction
 */

/**
 * Tags to skip - non-visual or structural elements that don't represent UI components
 * @type {string[]}
 */
export const SKIP_TAGS = [
  "script",
  "style",
  "noscript",
  "svg",
  "path",
  "defs",
  "br",
  "hr",
  "template",
  "head",
  "meta",
  "link",
  "title",
  "base",
  "slot",
  "use",
  "symbol",
  "g",
  "rect",
  "circle",
  "ellipse",
  "line",
  "polyline",
  "polygon",
  "text",
  "tspan",
  "textPath",
  "marker",
  "clipPath",
  "mask",
  "filter",
  "pattern",
  "linearGradient",
  "radialGradient",
  "stop",
];

/**
 * Check if element is visually meaningful and should be extracted
 * @param {Element} el - DOM element
 * @param {CSSStyleDeclaration} styles - Computed styles
 * @returns {boolean}
 */
export function isVisibleElement(el, styles) {
  const tagName = el.tagName.toLowerCase();

  // Skip non-visual tags
  if (SKIP_TAGS.includes(tagName)) {
    return false;
  }

  // Check computed styles for visibility
  const display = styles.getPropertyValue("display");
  const visibility = styles.getPropertyValue("visibility");
  const opacity = styles.getPropertyValue("opacity");

  if (display === "none" || visibility === "hidden" || opacity === "0" || opacity === "0.0") {
    return false;
  }

  // Check bounding rect - zero size means not visible
  const rect = el.getBoundingClientRect();
  if (rect.width === 0 && rect.height === 0) {
    return false;
  }

  // Check for zero size in computed styles
  const width = styles.getPropertyValue("width");
  const height = styles.getPropertyValue("height");
  if ((width === "0px" || width === "0") && (height === "0px" || height === "0")) {
    return false;
  }

  return true;
}
