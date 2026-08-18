import { generateCSS } from './generate-css.js';

/**
 * Generate HTML component from specification
 * @param {Object} spec - Component specification
 * @param {Object} _options - Generation options (unused, kept for API compatibility)
 * @returns {Object} Generated code files
 */
export function generateHTML(spec, _options) {
  const { name } = spec;
  const componentName = name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${name}</title>
  <style>
${generateCSS(spec, 'html')}
  </style>
</head>
<body>
  <button class="${componentName} ${componentName}--primary ${componentName}--md">
    Button
  </button>
  
  <script>
    // Component initialization if needed
  </script>
</body>
</html>`;

  return {
    [`${componentName}.html`]: html,
    [`${componentName}.css`]: generateCSS(spec, 'html'),
  };
}
