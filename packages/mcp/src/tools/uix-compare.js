import { compare } from '@unweave/core';

export const uixCompareTool = {
  name: 'uix_compare',
  description: 'Compare two URLs design systems and components',
  inputSchema: {
    type: 'object',
    properties: {
      url1: { type: 'string', description: 'First URL' },
      url2: { type: 'string', description: 'Second URL' },
    },
    required: ['url1', 'url2'],
  },
  handler: async (args) => {
    const comparison = await compare(args.url1, args.url2);
    return { content: [{ type: 'text', text: JSON.stringify(comparison, null, 2) }] };
  },
};
