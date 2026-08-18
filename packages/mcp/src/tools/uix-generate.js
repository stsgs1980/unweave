import { extract, analyze, generateSpec, generate } from '@unweave/core';

export const uixGenerateTool = {
  name: 'uix_generate',
  description: 'Generate component code from URL',
  inputSchema: {
    type: 'object',
    properties: {
      url: { type: 'string', description: 'URL to process' },
      component: { type: 'string', description: 'Component name' },
      componentType: {
        type: 'string',
        enum: ['button', 'input', 'card', 'modal', 'navigation', 'generic'],
      },
      format: { type: 'string', enum: ['react', 'vue', 'html'], description: 'Output format' },
      typescript: { type: 'boolean', default: true },
    },
    required: ['url', 'component', 'format'],
  },
  handler: async (args) => {
    const extracted = await extract(args.url);
    const analysis = analyze(extracted);
    const spec = generateSpec(analysis, {
      componentName: args.component,
      componentType: args.componentType,
      source: args.url,
    });
    const generated = generate(spec, {
      format: args.format,
      typescript: args.typescript,
    });
    return { content: [{ type: 'text', text: JSON.stringify(generated, null, 2) }] };
  },
};
