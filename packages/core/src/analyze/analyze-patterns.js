/**
 * Pattern detection utilities
 */

/**
 * Detect CSS patterns from elements
 * @param {Array} elements - Extracted elements
 * @returns {Object} Pattern analysis
 */
export function detectPatterns(elements) {
  const patterns = {
    flexbox: 0,
    grid: 0,
    absolutePositioning: 0,
    fixedPositioning: 0,
    mediaQueries: 0,
    animations: 0,
    transitions: 0,
  };

  for (const el of elements) {
    const styles = el.computedStyles || {};

    if (styles.display === "flex" || styles.display === "inline-flex") patterns.flexbox++;
    if (styles.display === "grid" || styles.display === "inline-grid") patterns.grid++;
    if (styles.position === "absolute") patterns.absolutePositioning++;
    if (styles.position === "fixed") patterns.fixedPositioning++;
    if (styles.animation && styles.animation !== "none") patterns.animations++;
    if (styles.transition && styles.transition !== "none") patterns.transitions++;
  }

  return patterns;
}
