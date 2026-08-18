/**
 * Generate responsive definition from design system
 * @param {Object} _designSystem - Design system (unused, kept for API compatibility)
 * @returns {Object} Responsive definition
 */
export function generateResponsive(_designSystem) {
  const breakpoints = {
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
    "2xl": "1536px",
  };

  return {
    breakpoints,
    container: "max-width: 1280px; margin: 0 auto; padding: 0 1rem;",
    spacing: "Fluid spacing using clamp() or responsive tokens",
    typography: "Fluid type scale",
  };
}
