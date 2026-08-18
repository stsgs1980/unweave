/**
 * Generate component variants from design system
 * @param {Object} designSystem - Design system from analysis
 * @param {string} componentType - Type of component
 * @returns {Object} Variants definition
 */
export function generateVariants(designSystem, componentType) {
  const { colors } = designSystem || {};

  const variants = {};

  // Generate variants based on design system tokens
  if (componentType === "button") {
    variants.primary = {
      description: "Primary action",
      tokens: { bg: colors.cssVariables?.["--color-primary"] || "#0066cc", color: "#fff" },
    };
    variants.secondary = {
      description: "Secondary action",
      tokens: { bg: colors.cssVariables?.["--color-secondary"] || "#6c757d", color: "#fff" },
    };
    variants.outline = {
      description: "Outlined style",
      tokens: {
        bg: "transparent",
        border: colors.cssVariables?.["--color-primary"] || "#0066cc",
        color: colors.cssVariables?.["--color-primary"] || "#0066cc",
      },
    };
    variants.ghost = {
      description: "Ghost style",
      tokens: { bg: "transparent", color: colors.cssVariables?.["--color-primary"] || "#0066cc" },
    };
    variants.destructive = {
      description: "Destructive action",
      tokens: { bg: colors.cssVariables?.["--color-danger"] || "#dc3545", color: "#fff" },
    };
  }

  return variants;
}
