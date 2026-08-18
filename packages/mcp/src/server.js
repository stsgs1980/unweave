import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import {
  uixPipelineTool,
  uixExtractTool,
  uixAnalyzeTool,
  uixSpecTool,
  uixGenerateTool,
  uixLearnTool,
  uixReferencesTool,
  uixGenerateFromReferenceTool,
  uixCompareTool,
} from './tools/index.js';

const server = new Server(
  {
    name: 'ui-extractor',
    version: '0.1.0',
  },
  {
    capabilities: {
      tools: {},
    },
  },
);

const tools = [
  uixPipelineTool,
  uixExtractTool,
  uixAnalyzeTool,
  uixSpecTool,
  uixGenerateTool,
  uixLearnTool,
  uixReferencesTool,
  uixGenerateFromReferenceTool,
  uixCompareTool,
];

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: tools.map((t) => ({
      name: t.name,
      description: t.description,
      inputSchema: t.inputSchema,
    })),
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const tool = tools.find((t) => t.name === name);

  if (!tool) {
    throw new Error(`Unknown tool: ${name}`);
  }

  try {
    return await tool.handler(args);
  } catch (error) {
    return {
      content: [{ type: 'text', text: `Error: ${error.message}` }],
      isError: true,
    };
  }
});

/**
 *
 */
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('UI Extractor MCP server running on stdio');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
