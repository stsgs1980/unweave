import { extractColors } from "./analyze/analyze-colors.js";
import { extractSpacing } from "./analyze/analyze-spacing.js";
import { extractRadius } from "./analyze/analyze-radius.js";
import { extractTypography } from "./analyze/analyze-typography.js";
import { classifyComponents } from "./analyze/analyze-components.js";
import { detectPatterns } from "./analyze/analyze-patterns.js";

/**
 * Analyze extracted UI data to detect patterns and design system
 * @param {Object} extractedData - Data from extract()
 * @returns {Object} Analysis results
 */
export function analyze(extractedData) {
  if (!extractedData || extractedData.error) {
    return { error: extractedData?.error || "Invalid extracted data" };
  }

  const elements = extractedData.elements || [];
  const cssVariables = extractedData.cssVariables || {};

  // Color analysis
  const colors = extractColors(elements, cssVariables);

  // Spacing analysis
  const spacing = extractSpacing(elements);

  // Border radius analysis
  const radius = extractRadius(elements);

  // Typography analysis
  const typography = extractTypography(elements);

  // Component classification
  const components = classifyComponents(elements);

  return {
    designSystem: {
      colors,
      spacing,
      radius,
      typography,
    },
    components,
    patterns: detectPatterns(elements),
    stats: {
      totalElements: elements.length,
      uniqueColors: colors.all.length,
      uniqueSpacing: spacing.all.length,
      uniqueRadius: radius.all.length,
      uniqueFonts: typography.fonts.length,
    },
  };
}

// Re-export utilities
export { extractColors } from "./analyze/analyze-colors.js";
export { extractSpacing } from "./analyze/analyze-spacing.js";
export { extractRadius } from "./analyze/analyze-radius.js";
export { extractTypography } from "./analyze/analyze-typography.js";
export {
  classifyComponents,
  buildSelector,
  inferComponentType,
} from "./analyze/analyze-components.js";
export { detectPatterns } from "./analyze/analyze-patterns.js";
