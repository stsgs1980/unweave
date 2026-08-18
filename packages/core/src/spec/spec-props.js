/**
 * Generate component props from design system
 * @param {Object} designSystem - Design system from analysis
 * @param {string} componentType - Type of component
 * @returns {Object} Props definition
 */
export function generateProps(designSystem, componentType) {
  const baseProps = {
    className: { type: 'string', description: 'Additional CSS classes', required: false },
    children: { type: 'node', description: 'Component content', required: false },
    'data-testid': { type: 'string', description: 'Test identifier', required: false },
  };

  const typeProps = {
    button: {
      variant: {
        type: 'string',
        enum: ['primary', 'secondary', 'outline', 'ghost', 'destructive'],
        default: 'primary',
        description: 'Visual style variant',
      },
      size: { type: 'string', enum: ['sm', 'md', 'lg'], default: 'md', description: 'Button size' },
      disabled: { type: 'boolean', default: false, description: 'Disable the button' },
      loading: { type: 'boolean', default: false, description: 'Show loading state' },
      onClick: { type: 'function', description: 'Click handler' },
      type: {
        type: 'string',
        enum: ['button', 'submit', 'reset'],
        default: 'button',
        description: 'Native button type',
      },
    },
    input: {
      type: {
        type: 'string',
        enum: ['text', 'email', 'password', 'number', 'tel', 'url'],
        default: 'text',
      },
      placeholder: { type: 'string', description: 'Placeholder text' },
      value: { type: 'string', description: 'Input value (controlled)' },
      defaultValue: { type: 'string', description: 'Default value (uncontrolled)' },
      disabled: { type: 'boolean', default: false },
      required: { type: 'boolean', default: false },
      error: { type: 'string', description: 'Error message' },
      label: { type: 'string', description: 'Label text' },
      onChange: { type: 'function', description: 'Change handler' },
      onBlur: { type: 'function', description: 'Blur handler' },
    },
    card: {
      variant: { type: 'string', enum: ['elevated', 'outlined', 'filled'], default: 'elevated' },
      padding: { type: 'string', enum: ['none', 'sm', 'md', 'lg'], default: 'md' },
      hoverable: { type: 'boolean', default: false },
      onClick: { type: 'function' },
    },
    modal: {
      open: { type: 'boolean', default: false, required: true },
      onClose: { type: 'function', required: true, description: 'Close handler' },
      title: { type: 'string', description: 'Modal title' },
      size: { type: 'string', enum: ['sm', 'md', 'lg', 'xl', 'full'], default: 'md' },
      closeOnOverlayClick: { type: 'boolean', default: true },
      closeOnEscape: { type: 'boolean', default: true },
    },
    navigation: {
      items: { type: 'array', description: 'Navigation items', required: true },
      orientation: { type: 'string', enum: ['horizontal', 'vertical'], default: 'horizontal' },
      activeItem: { type: 'string', description: 'Active item key' },
      onSelect: { type: 'function', description: 'Selection handler' },
    },
  };

  return {
    ...baseProps,
    ...(typeProps[componentType] || {}),
  };
}
