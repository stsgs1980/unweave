/**
 * Generate component states from component type
 * @param {string} componentType - Type of component
 * @returns {Object} States definition
 */
export function generateStates(componentType) {
  const baseStates = {
    default: { description: 'Default state' },
    hover: { description: 'Hover state' },
    focus: { description: 'Focus state (keyboard navigation)' },
    active: { description: 'Active/pressed state' },
    disabled: { description: 'Disabled state' },
  };

  const typeStates = {
    button: {
      ...baseStates,
      loading: { description: 'Loading state with spinner' },
    },
    input: {
      ...baseStates,
      error: { description: 'Validation error state' },
      filled: { description: 'Has value' },
      placeholder: { description: 'Showing placeholder' },
    },
    card: {
      ...baseStates,
      selected: { description: 'Selected state (for selectable cards)' },
    },
    modal: {
      open: { description: 'Modal is visible' },
      closed: { description: 'Modal is hidden' },
      closing: { description: 'Closing animation' },
    },
  };

  return typeStates[componentType] || baseStates;
}
