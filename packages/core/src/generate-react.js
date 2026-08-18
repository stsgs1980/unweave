import { generateCSS } from './generate-css.js';
import { generateStorybook } from './generate-storybook.js';

/**
 * Generate React component from specification
 * @param {Object} spec - Component specification
 * @param {Object} options - Generation options
 * @returns {Object} Generated code files
 */
export function generateReact(spec, options) {
  const { name, props } = spec;
  const componentName = name.replace(/[^a-zA-Z0-9]/g, '');
  const useTypeScript = options.typescript !== false;

  const propDestructuring = Object.keys(props || {}).join(', ');
  const classNameHandling = `const classNames = ['${componentName.toLowerCase()}', className, variant && \`${componentName.toLowerCase()}--\${variant}\`, size && \`${componentName.toLowerCase()}--\${size}\`].filter(Boolean).join(' ');`;

  let componentCode;
  if (useTypeScript) {
    componentCode = `import React, { forwardRef } from 'react';

/**
 * @typedef {Object} ${componentName}Props
 * @property {string} [className] - Additional CSS classes
 * @property {React.ReactNode} [children] - Component content
 * @property {string} [variant='primary'] - Visual style variant
 * @property {string} [size='md'] - Button size
 * @property {boolean} [disabled=false] - Disable the button
 * @property {boolean} [loading=false] - Show loading state
 * @property {Function} [onClick] - Click handler
 * @property {'button'|'submit'|'reset'} [type='button'] - Native button type
 */

export const ${componentName} = forwardRef(
  ({ ${propDestructuring}, ...rest }, ref) => {
    ${classNameHandling}
    
    return (
      <button
        ref={ref}
        className={classNames}
        {...rest}
      >
        {children}
      </button>
    );
  }
);

${componentName}.displayName = '${componentName}';
`;
  } else {
    componentCode = `import React, { forwardRef } from 'react';

export const ${componentName} = forwardRef(
  ({ ${propDestructuring}, ...rest }, ref) => {
    ${classNameHandling}
    
    return (
      <button
        ref={ref}
        className={classNames}
        {...rest}
      >
        {children}
      </button>
    );
  }
);

${componentName}.displayName = '${componentName}';
`;
  }

  const cssCode = generateCSS(spec, 'react');

  return {
    [`${componentName}.${useTypeScript ? 'tsx' : 'jsx'}`]: componentCode,
    [`${componentName}.css`]: cssCode,
    [`${componentName}.stories.${useTypeScript ? 'tsx' : 'jsx'}`]: generateStorybook(spec),
  };
}
