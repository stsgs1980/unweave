/**
 * Spacing analysis utilities
 */

/**
 * Check if a value is a length (px, rem, em, %)
 * @param {string} value - CSS value
 * @returns {boolean}
 */
export function isLength(value) {
  return /^\d+(\.\d+)?(px|rem|em|%)$/.test(value);
}

/**
 * Add spacing value to array if not seen
 * @param {Array} arr - Target array
 * @param {number} value - Spacing value
 * @param {Set} seen - Set of seen values
 */
export function addSpacing(arr, value, seen) {
  if (!seen.has(value)) {
    seen.add(value);
    arr.push(value);
  }
}

/**
 * Extract spacing from elements
 * @param {Array} elements - Extracted elements
 * @returns {Object} Spacing analysis
 */
export function extractSpacing(elements) {
  const spacingProps = [
    "padding",
    "padding-top",
    "padding-right",
    "padding-bottom",
    "padding-left",
    "margin",
    "margin-top",
    "margin-right",
    "margin-bottom",
    "margin-left",
    "gap",
    "grid-gap",
  ];
  const spacing = { all: [], padding: [], margin: [], gap: [] };
  const seen = new Set();

  for (const el of elements) {
    const styles = el.computedStyles || {};
    for (const prop of spacingProps) {
      const value = styles[prop];
      if (value && isLength(value)) {
        const num = parseFloat(value);
        if (num > 0) {
          addSpacing(spacing.all, num, seen);
          if (prop.startsWith("padding")) addSpacing(spacing.padding, num, seen);
          if (prop.startsWith("margin")) addSpacing(spacing.margin, num, seen);
          if (prop === "gap" || prop === "grid-gap") addSpacing(spacing.gap, num, seen);
        }
      }
    }
  }

  return spacing;
}
