import { generateReact } from "./generate-react.js";
import { generateVue } from "./generate-vue.js";
import { generateHTML } from "./generate-html.js";

/**
 * Generate component code from specification
 * @param {Object} spec - Component specification from generateSpec()
 * @param {Object} options - Generation options
 * @returns {Object} Generated code files
 */
export function generate(spec, options = {}) {
  if (!spec || spec.error) {
    return { error: spec?.error || "Invalid spec" };
  }

  const format = options.format || "react";

  switch (format) {
    case "react":
      return generateReact(spec, options);
    case "vue":
      return generateVue(spec, options);
    case "html":
      return generateHTML(spec, options);
    default:
      return { error: `Unsupported format: ${format}` };
  }
}

export { generateCSS } from "./generate-css.js";
export { generateStorybook } from "./generate-storybook.js";
