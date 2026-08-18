import { extract, analyze } from '@unweave/core';

export const uixAnalyzeTool = {
  name: 'uix_analyze',
  description: 'Analyze patterns and design system from URL',
  inputSchema: {
    type: 'object',
    properties: {
      url: { type: 'string', description: 'URL to analyze' },
    },
    required: ['url'],
  },
  handler: async (args) => {
    const extracted = await extract(args.url);
    const analysis = analyze(extracted);
    return { content: [{ type: 'text', text: JSON.stringify(analysis, null, 2) }] };
  },
};
