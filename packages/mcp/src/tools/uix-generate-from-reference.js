import { pipelineFromReference } from '@unweave/core';

export const uixGenerateFromReferenceTool = {
  name: 'uix_generate_from_reference',
  description: 'Generate component code from saved reference',
  inputSchema: {
    type: 'object',
    properties: {
      name: { type: 'string', description: 'Reference name' },
      format: { type: 'string', enum: ['react', 'vue', 'html'], description: 'Output format' },
      typescript: { type: 'boolean', default: true },
    },
    required: ['name', 'format'],
  },
  handler: async (args) => {
    const generated = await pipelineFromReference(args.name, {
      format: args.format,
      typescript: args.typescript,
    });
    return { content: [{ type: 'text', text: JSON.stringify(generated, null, 2) }] };
  },
};
