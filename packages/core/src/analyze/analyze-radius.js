import { isLength, addSpacing } from "./analyze-spacing.js";

/**
 * Extract border radius from elements
 * @param {Array} elements - Extracted elements
 * @returns {Object} Radius analysis
 */
export function extractRadius(elements) {
  const radiusProps = [
    "border-radius",
    "border-top-left-radius",
    "border-top-right-radius",
    "border-bottom-left-radius",
    "border-bottom-right-radius",
  ];
  const radius = { all: [] };
  const seen = new Set();

  for (const el of elements) {
    const styles = el.computedStyles || {};
    for (const prop of radiusProps) {
      const value = styles[prop];
      if (value && isLength(value)) {
        const num = parseFloat(value);
        if (num > 0) addSpacing(radius.all, num, seen);
      }
    }
  }

  return radius;
}
