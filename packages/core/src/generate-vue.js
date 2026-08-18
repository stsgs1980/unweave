import { generateCSS } from "./generate-css.js";

/**
 * Generate Vue component from specification
 * @param {Object} spec - Component specification
 * @param {Object} _options - Generation options (unused, kept for API compatibility)
 * @returns {Object} Generated code files
 */
export function generateVue(spec, _options) {
  const { name, props } = spec;
  const componentName = name.replace(/[^a-zA-Z0-9]/g, "");

  const propDefinitions = Object.entries(props || {})
    .map(([key, config]) => {
      const type = getVueType(config);
      const required = config.required ? ", required: true" : "";
      const defaultVal =
        config.default !== undefined ? `, default: ${JSON.stringify(config.default)}` : "";
      return `  ${key}: { type: ${type}${required}${defaultVal} }`;
    })
    .join(",\n");

  const template = `<template>
  <button
    :class="['${componentName.toLowerCase()}', \`${componentName.toLowerCase()}--\${variant}\`, \`${componentName.toLowerCase()}--\${size}\`]"
    :disabled="disabled"
    :type="type"
    @click="$emit('click', $event)"
  >
    <slot />
  </button>
</template>

<script setup>
defineProps({
${propDefinitions}
});

defineEmits(['click']);
</script>

<style scoped>
@import './${componentName}.css';
</style>`;

  const cssCode = generateCSS(spec, "vue");

  return {
    [`${componentName}.vue`]: template,
    [`${componentName}.css`]: cssCode,
  };
}

/**
 * Map config type to Vue type
 * @param {Object} config - Prop config
 * @returns {string} Vue type
 */
function getVueType(config) {
  switch (config.type) {
    case "string":
      return "String";
    case "number":
      return "Number";
    case "boolean":
      return "Boolean";
    case "function":
      return "Function";
    case "array":
      return "Array";
    case "object":
      return "Object";
    default:
      return "String";
  }
}
