/**
 * Color analysis utilities
 */

/**
 * Check if a value is a color
 * @param {string} value - CSS value to check
 * @returns {boolean}
 */
export function isColor(value) {
  return (
    /^(rgb|rgba|hsl|hsla|#)[(#]/.test(value) ||
    /^(transparent|currentColor|inherit|initial|unset)$/.test(value) ||
    /^[a-z]+$/.test(value)
  ); // named colors
}

/**
 * Normalize color value
 * @param {string} color - Color value
 * @returns {string} Normalized color
 */
export function normalizeColor(color) {
  return color.trim().toLowerCase();
}

/**
 * Add color to array if not seen
 * @param {Array} arr - Target array
 * @param {string} value - Color value
 * @param {Set} seen - Set of seen values
 */
export function addColor(arr, value, seen) {
  const normalized = normalizeColor(value);
  if (!seen.has(normalized)) {
    seen.add(normalized);
    arr.push(normalized);
  }
}

/**
 * Extract colors from elements and CSS variables
 * @param {Array} elements - Extracted elements
 * @param {Object} cssVariables - CSS variables
 * @returns {Object} Color analysis
 */
export function extractColors(elements, cssVariables) {
  const colorProps = ["color", "background-color", "border-color", "fill", "stroke"];
  const colors = { all: [], backgrounds: [], text: [], borders: [], cssVariables: {} };
  const seen = new Set();

  // From CSS variables
  for (const [key, value] of Object.entries(cssVariables)) {
    if (isColor(value)) {
      colors.cssVariables[key] = value;
      addColor(colors.all, value, seen);
    }
  }

  // From computed styles
  for (const el of elements) {
    const styles = el.computedStyles || {};
    for (const prop of colorProps) {
      const value = styles[prop];
      if (value && isColor(value)) {
        addColor(colors.all, value, seen);
        if (prop === "background-color") addColor(colors.backgrounds, value, seen);
        if (prop === "color") addColor(colors.text, value, seen);
        if (prop === "border-color") addColor(colors.borders, value, seen);
      }
    }
  }

  return colors;
}
