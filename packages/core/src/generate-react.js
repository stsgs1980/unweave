import { generateCSS } from "./generate-css.js";
import { generateStorybook } from "./generate-storybook.js";

/**
 * Capitalize first letter of a string
 * @param {string} str - Input string
 * @returns {string} Capitalized string
 */
function capitalize(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Convert component name to kebab-case for CSS classes
 * @param {string} name - Component name (PascalCase or camelCase)
 * @returns {string} kebab-case name
 */
function toKebabCase(name) {
  if (!name) return "";
  return name
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[^a-zA-Z0-9-]/g, "")
    .toLowerCase();
}

/**
 * Convert kebab-case prop name to camelCase for destructuring
 * Handles common React conventions (data-testid -> dataTestId)
 * @param {string} name - Property name
 * @returns {string} camelCase name
 */
function toCamelCase(name) {
  if (name === "data-testid") return "dataTestId";
  return name.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Map spec prop type to TypeScript type
 * @param {string} specType - Type from specification
 * @returns {string} TypeScript type
 */
function mapPropType(specType) {
  const typeMap = {
    string: "string",
    number: "number",
    boolean: "boolean",
    function: "() => void",
    node: "React.ReactNode",
    element: "React.ReactElement",
    array: "unknown[]",
    object: "Record<string, unknown>",
  };
  return typeMap[specType.toLowerCase()] || "unknown";
}

/**
 * Build props destructuring string with default values
 * @param {Object} props - Props specification
 * @returns {string} Destructuring string for function parameters
 */
function buildDestructuring(props) {
  const skip = new Set(["className", "children"]);
  const parts = ["className", "children"];

  for (const [key, prop] of Object.entries(props || {})) {
    if (skip.has(key)) continue;

    const camelKey = toCamelCase(key);
    const safeKey = key !== camelKey ? `'${key}': ${camelKey}` : camelKey;

    if (prop.default !== undefined) {
      const value = JSON.stringify(prop.default).replace(/"/g, "'");
      parts.push(`${safeKey} = ${value}`);
    } else {
      parts.push(safeKey);
    }
  }

  return parts.join(", ");
}

/**
 * Generate TypeScript interface for component props
 * @param {Object} props - Props specification
 * @param {string} componentName - Component name (PascalCase)
 * @returns {string} TypeScript interface code
 */
function generatePropsInterface(props, componentName) {
  const lines = [];

  for (const [key, prop] of Object.entries(props || {})) {
    const type = mapPropType(prop.type || "string");
    const optional = prop.optional !== false ? "?" : "";
    const camelKey = toCamelCase(key);

    if (prop.description) {
      lines.push(`  /** ${prop.description} */`);
    }

    lines.push(`  ${camelKey}${optional}: ${type};`);
  }

  return `export interface ${componentName}Props {\n${lines.join("\n")}\n}`;
}

/**
 * Generate React component body (shared between TS and JS variants)
 * @param {string} cssClassName - CSS class name (kebab-case)
 * @returns {string} Component body code
 */
function generateComponentBody(cssClassName) {
  return `    const classNames = [
      '${cssClassName}',
      className,
      variant && \`${cssClassName}--\${variant}\`,
      size && \`${cssClassName}--\${size}\`,
    ].filter(Boolean).join(' ');

    return (
      <button
        ref={ref}
        className={classNames}
        data-testid={dataTestId}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        {...rest}
      >
        {children}
      </button>
    );`;
}

/**
 * Generate TypeScript component code
 * @param {string} componentName - Component name (PascalCase)
 * @param {string} destructuring - Destructured props string
 * @param {string} body - Component body code
 * @param {Object} props - Props specification
 * @returns {string} TypeScript component code
 */
function generateTypeScriptComponent(componentName, destructuring, body, props) {
  const propsInterface = generatePropsInterface(props, componentName);

  return `import React, { forwardRef } from 'react';

${propsInterface}

/**
 * ${componentName} component
 * @param {${componentName}Props} props - Component props
 * @param {React.Ref<HTMLButtonElement>} ref - Forwarded ref
 * @returns {React.ReactElement} Rendered component
 */
export const ${componentName} = forwardRef<HTMLButtonElement, ${componentName}Props>(
  ({ ${destructuring}, ...rest }, ref) => {
${body}
  }
);

${componentName}.displayName = '${componentName}';
`;
}

/**
 * Generate JavaScript component code
 * @param {string} componentName - Component name (PascalCase)
 * @param {string} destructuring - Destructured props string
 * @param {string} body - Component body code
 * @returns {string} JavaScript component code
 */
function generateJavaScriptComponent(componentName, destructuring, body) {
  return `import React, { forwardRef } from 'react';

/**
 * ${componentName} component
 * @param {Object} props - Component props
 * @param {React.Ref<HTMLButtonElement>} props.ref - Forwarded ref
 * @returns {React.ReactElement} Rendered component
 */
export const ${componentName} = forwardRef(
  ({ ${destructuring}, ...rest }, ref) => {
${body}
  }
);

${componentName}.displayName = '${componentName}';
`;
}

/**
 * Generate React component from specification
 * @param {Object} spec - Component specification
 * @param {Object} options - Generation options
 * @param {boolean} [options.typescript=true] - Generate TypeScript code
 * @returns {Object} Generated code files
 */
export function generateReact(spec, options) {
  const { name, props } = spec;
  const rawName = (name || "Component").replace(/[^a-zA-Z0-9]/g, "");
  const componentName = capitalize(rawName);
  const cssClassName = toKebabCase(componentName);
  const useTypeScript = options.typescript !== false;

  const destructuring = buildDestructuring(props);
  const body = generateComponentBody(cssClassName);

  const componentCode = useTypeScript
    ? generateTypeScriptComponent(componentName, destructuring, body, props)
    : generateJavaScriptComponent(componentName, destructuring, body);

  const cssCode = generateCSS(spec, "react");

  return {
    [`${componentName}.${useTypeScript ? "tsx" : "jsx"}`]: componentCode,
    [`${componentName}.css`]: cssCode,
    [`${componentName}.stories.${useTypeScript ? "tsx" : "jsx"}`]: generateStorybook(spec),
  };
}
