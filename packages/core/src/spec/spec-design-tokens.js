/**
 * Extract design tokens from design system
 * @param {Object} designSystem - Design system from analysis
 * @returns {Object} Design tokens
 */
export function extractDesignTokens(designSystem) {
  const { colors, spacing, radius, typography } = designSystem || {};

  return {
    colors: {
      primary: colors.cssVariables?.["--color-primary"] || "#0066cc",
      secondary: colors.cssVariables?.["--color-secondary"] || "#6c757d",
      success: colors.cssVariables?.["--color-success"] || "#28a745",
      danger: colors.cssVariables?.["--color-danger"] || "#dc3545",
      warning: colors.cssVariables?.["--color-warning"] || "#ffc107",
      info: colors.cssVariables?.["--color-info"] || "#17a2b8",
      light: colors.cssVariables?.["--color-light"] || "#f8f9fa",
      dark: colors.cssVariables?.["--color-dark"] || "#343a40",
      backgrounds: colors.backgrounds?.slice(0, 10) || [],
      text: colors.text?.slice(0, 10) || [],
      borders: colors.borders?.slice(0, 10) || [],
    },
    spacing: {
      scale: spacing.all?.sort((a, b) => a - b).slice(0, 20) || [4, 8, 12, 16, 24, 32, 48, 64],
    },
    radius: {
      scale: radius.all?.sort((a, b) => a - b).slice(0, 10) || [4, 8, 12, 16],
    },
    typography: {
      fonts: typography.fonts || ["system-ui", "sans-serif"],
      sizes: typography.fontSizes?.sort((a, b) => a - b) || [12, 14, 16, 18, 20, 24, 30, 36, 48],
      weights: typography.fontWeights || ["400", "500", "600", "700"],
    },
  };
}
