/**
 * Typography analysis utilities
 */

/**
 * Extract typography from elements
 * @param {Array} elements - Extracted elements
 * @returns {Object} Typography analysis
 */
export function extractTypography(elements) {
  const typography = { fonts: [], fontSizes: [], fontWeights: [], lineHeights: [] };
  const fontSeen = new Set();
  const sizeSeen = new Set();
  const weightSeen = new Set();
  const lhSeen = new Set();

  for (const el of elements) {
    const styles = el.computedStyles || {};

    const family = styles['font-family'];
    if (family && !fontSeen.has(family)) {
      fontSeen.add(family);
      typography.fonts.push(family);
    }

    const size = styles['font-size'];
    if (size && /^\d+(\.\d+)?(px|rem|em|%)$/.test(size)) {
      const num = parseFloat(size);
      if (!sizeSeen.has(num)) {
        sizeSeen.add(num);
        typography.fontSizes.push(num);
      }
    }

    const weight = styles['font-weight'];
    if (weight && !weightSeen.has(weight)) {
      weightSeen.add(weight);
      typography.fontWeights.push(weight);
    }

    const lh = styles['line-height'];
    if (lh && lh !== 'normal' && !lhSeen.has(lh)) {
      lhSeen.add(lh);
      typography.lineHeights.push(lh);
    }
  }

  return typography;
}
