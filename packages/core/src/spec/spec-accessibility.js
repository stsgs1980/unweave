/**
 * Generate accessibility definition from component type
 * @param {string} componentType - Type of component
 * @returns {Object} Accessibility definition
 */
export function generateAccessibility(componentType) {
  const baseA11y = {
    keyboardNavigation: "Full keyboard support",
    ariaAttributes: ["aria-label", "aria-describedby", "aria-expanded", "aria-controls"],
    focusManagement: "Focus trap for modals, visible focus indicators",
    colorContrast: "WCAG AA minimum 4.5:1",
    screenReader: "Semantic HTML, proper labels",
  };

  const typeA11y = {
    button: {
      ...baseA11y,
      role: "button",
      ariaPressed: "For toggle buttons",
      ariaDisabled: "When disabled",
    },
    input: {
      ...baseA11y,
      role: "textbox",
      ariaRequired: "When required",
      ariaInvalid: "When error",
      ariaDescribedBy: "Links to error/help text",
      labelAssociation: "Explicit <label for> or aria-label",
    },
    modal: {
      ...baseA11y,
      role: "dialog",
      ariaModal: "true",
      ariaLabelledBy: "References title",
      ariaDescribedBy: "References description",
      focusTrap: "Required",
      restoreFocus: "On close",
    },
  };

  return typeA11y[componentType] || baseA11y;
}
