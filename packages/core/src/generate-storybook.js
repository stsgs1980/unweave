/**
 * Generate Storybook stories for component
 * @param {Object} spec - Component specification
 * @returns {string} Storybook code
 */
export function generateStorybook(spec) {
  const { name } = spec;
  const componentName = name.replace(/[^a-zA-Z0-9]/g, "");

  return `import type { Meta, StoryObj } from '@storybook/react';
import { ${componentName} } from './${componentName}';

const meta = {
  title: 'Components/${componentName}',
  component: ${componentName},
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outline', 'ghost', 'destructive'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
};

export default meta;

export const Primary = {
  args: {
    variant: 'primary',
    children: 'Primary Button',
  },
};

export const Secondary = {
  args: {
    variant: 'secondary',
    children: 'Secondary Button',
  },
};

export const Outline = {
  args: {
    variant: 'outline',
    children: 'Outline Button',
  },
};

export const Loading = {
  args: {
    variant: 'primary',
    loading: true,
    children: 'Loading...',
  },
};

export const Disabled = {
  args: {
    variant: 'primary',
    disabled: true,
    children: 'Disabled',
  },
};
`;
}
