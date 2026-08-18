import { pipeline } from '@unweave/core';

export const uixPipelineTool = {
  name: 'uix_pipeline',
  description: 'Full pipeline: extract + analyze + spec + generate from URL',
  inputSchema: {
    type: 'object',
    properties: {
      url: { type: 'string', description: 'URL to process' },
      component: { type: 'string', description: 'Component name to generate' },
      componentType: {
        type: 'string',
        enum: ['button', 'input', 'card', 'modal', 'navigation', 'generic'],
        description: 'Component type',
      },
      format: { type: 'string', enum: ['react', 'vue', 'html'], description: 'Output format' },
      typescript: { type: 'boolean', default: true, description: 'Use TypeScript' },
      screenshot: { type: 'boolean', default: false, description: 'Take screenshots' },
      screenshotTypes: {
        type: 'array',
        items: { type: 'string' },
        default: ['viewport'],
        description: 'Screenshot types',
      },
      learn: { type: 'string', description: 'Save as reference name' },
    },
    required: ['url'],
  },
  handler: async (args) => {
    const results = await pipeline([args.url], {
      component: args.component,
      componentType: args.componentType,
      format: args.format,
      typescript: args.typescript,
      screenshot: args.screenshot,
      screenshotTypes: args.screenshotTypes,
      learn: args.learn,
    });
    return { content: [{ type: 'text', text: JSON.stringify(results[0], null, 2) }] };
  },
};
