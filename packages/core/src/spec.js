import { generateProps } from "./spec/spec-props.js";
import { generateStates } from "./spec/spec-states.js";
import { generateVariants } from "./spec/spec-variants.js";
import { generateAccessibility } from "./spec/spec-accessibility.js";
import { generateResponsive } from "./spec/spec-responsive.js";
import { extractDesignTokens } from "./spec/spec-design-tokens.js";
import { generateExamples } from "./spec/spec-examples.js";

/**
 * Generate component specification from analyzed data
 * @param {Object} analysis - Analysis results from analyze()
 * @param {Object} options - Spec generation options
 * @returns {Object} Component specification
 */
export function generateSpec(analysis, options = {}) {
  if (!analysis || analysis.error) {
    return { error: analysis?.error || "Invalid analysis data" };
  }

  const { designSystem } = analysis;
  const componentName = options.componentName || "Component";
  const componentType = options.componentType || "generic";

  const spec = {
    name: componentName,
    type: componentType,
    description: options.description || "",
    props: generateProps(designSystem, componentType),
    states: generateStates(componentType),
    variants: generateVariants(designSystem, componentType),
    accessibility: generateAccessibility(componentType),
    responsive: generateResponsive(designSystem),
    designTokens: extractDesignTokens(designSystem),
    examples: generateExamples(componentType),
    metadata: {
      generatedAt: new Date().toISOString(),
      source: options.source || "unknown",
    },
  };

  return spec;
}

export { generateProps } from "./spec/spec-props.js";
export { generateStates } from "./spec/spec-states.js";
export { generateVariants } from "./spec/spec-variants.js";
export { generateAccessibility } from "./spec/spec-accessibility.js";
export { generateResponsive } from "./spec/spec-responsive.js";
export { extractDesignTokens } from "./spec/spec-design-tokens.js";
export { generateExamples } from "./spec/spec-examples.js";
