/**
 * Generate CSS for component from design tokens
 * @param {Object} spec - Component specification
 * @param {string} _format - Target format (unused, kept for API compatibility)
 * @returns {string} CSS code
 */
export function generateCSS(spec, _format) {
  const { name, designTokens } = spec;
  const componentName = name.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
  const tokens = designTokens || {};
  const colors = tokens.colors || {};
  const spacing = tokens.spacing || {};
  const radius = tokens.radius || {};

  const primaryColor = colors.primary || "#0066cc";
  const secondaryColor = colors.secondary || "#6c757d";
  const dangerColor = colors.danger || "#dc3545";
  const borderRadius = radius.scale?.[1] || "8";
  const spacingSm = spacing.scale?.[1] || "8";
  const spacingMd = spacing.scale?.[2] || "16";
  const spacingLg = spacing.scale?.[3] || "24";

  return `:root {
  --${componentName}-bg-primary: ${primaryColor};
  --${componentName}-bg-secondary: ${secondaryColor};
  --${componentName}-bg-danger: ${dangerColor};
  --${componentName}-text-on-primary: #fff;
  --${componentName}-border-radius: ${borderRadius}px;
  --${componentName}-spacing-sm: ${spacingSm}px;
  --${componentName}-spacing-md: ${spacingMd}px;
  --${componentName}-spacing-lg: ${spacingLg}px;
  --${componentName}-font-size: 1rem;
  --${componentName}-font-weight: 500;
  --${componentName}-transition: all 0.2s ease;
}

.${componentName} {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--${componentName}-spacing-sm);
  padding: var(--${componentName}-spacing-sm) var(--${componentName}-spacing-md);
  font-size: var(--${componentName}-font-size);
  font-weight: var(--${componentName}-font-weight);
  line-height: 1.5;
  border: none;
  border-radius: var(--${componentName}-border-radius);
  cursor: pointer;
  transition: var(--${componentName}-transition);
  text-decoration: none;
  white-space: nowrap;
  user-select: none;
}

.${componentName}:focus-visible {
  outline: 2px solid var(--${componentName}-bg-primary);
  outline-offset: 2px;
}

.${componentName}:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Variants */
.${componentName}--primary {
  background-color: var(--${componentName}-bg-primary);
  color: var(--${componentName}-text-on-primary);
}

.${componentName}--primary:hover:not(:disabled) {
  filter: brightness(1.1);
}

.${componentName}--secondary {
  background-color: var(--${componentName}-bg-secondary);
  color: var(--${componentName}-text-on-primary);
}

.${componentName}--outline {
  background-color: transparent;
  border: 1px solid var(--${componentName}-bg-primary);
  color: var(--${componentName}-bg-primary);
}

.${componentName}--ghost {
  background-color: transparent;
  color: var(--${componentName}-bg-primary);
}

.${componentName}--destructive {
  background-color: var(--${componentName}-bg-danger);
  color: var(--${componentName}-text-on-primary);
}

/* Sizes */
.${componentName}--sm {
  padding: 4px 12px;
  font-size: 0.875rem;
}

.${componentName}--lg {
  padding: 12px 24px;
  font-size: 1.125rem;
}

/* Loading state */
.${componentName}--loading {
  position: relative;
  color: transparent;
}

.${componentName}--loading::after {
  content: '';
  position: absolute;
  width: 16px;
  height: 16px;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: ${componentName}-spin 0.6s linear infinite;
}

@keyframes ${componentName}-spin {
  to { transform: rotate(360deg); }
}
`;
}
