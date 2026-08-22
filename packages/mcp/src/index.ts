#!/usr/bin/env node

/**
 * @file MCP server entry point for unweave.
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";

/**
 * Creates and configures the unweave MCP server.
 * @returns {Server} The configured MCP server instance.
 */
function createServer(): Server {
  const server = new Server(
    { name: "unweave-mcp", version: "0.1.0" },
    { capabilities: { tools: {} } },
  );

  // Register available tools
  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
      {
        name: "extract_ui",
        description: "Extract UI components and design tokens from a given URL.",
        inputSchema: {
          type: "object",
          properties: {
            url: {
              type: "string",
              description: "The URL of the website to extract UI from.",
            },
          },
          required: ["url"],
        },
      },
      {
        name: "list_references",
        description: "List all saved design system references",
      },
      {
        name: "compare_designs",
        description: "Compare two URLs and return design system differences",
        inputSchema: {
          type: "object",
          properties: {
            url1: { type: "string" },
            url2: { type: "string" },
          },
          required: ["url1", "url2"],
        },
      },
    ],
  }));

  // Handle tool calls
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    if (request.params.name === "extract_ui") {
      const { url } = request.params.arguments as { url: string };

      try {
        // Import core
        const { pipeline } = await import("@unweave/core/pipeline");
        console.error(`[MCP] Starting extraction for: ${url}`);

        // Run pipeline
        const results = await pipeline(url);
        const result = results[0];

        if (result.success) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(result.analysis, null, 2),
              },
            ],
          };
        } else {
          return {
            content: [
              {
                type: "text",
                text: `Error: ${result.error}`,
              },
            ],
            isError: true,
          };
        }
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Failed to execute pipeline: ${error instanceof Error ? error.message : "Unknown error"}`,
            },
          ],
          isError: true,
        };
      }
    }

    if (request.params.name === "list_references") {
      try {
        const { listReferences } = await import("@unweave/core/pipeline");
        const names = await listReferences();
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(names),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Failed to list references: ${error instanceof Error ? error.message : "Unknown error"}`,
            },
          ],
          isError: true,
        };
      }
    }

    if (request.params.name === "compare_designs") {
      const { url1, url2 } = request.params.arguments as { url1: string; url2: string };

      try {
        const { compare } = await import("@unweave/core/pipeline");
        const result = await compare(url1, url2);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Failed to compare designs: ${error instanceof Error ? error.message : "Unknown error"}`,
            },
          ],
          isError: true,
        };
      }
    }

    throw new Error(`Unknown tool: ${request.params.name}`);
  });

  return server;
}

/**
 * Main function to start the MCP server.
 */
async function main(): Promise<void> {
  const server = createServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("[MCP] unweave MCP Server is running...");
}

main().catch((error) => {
  console.error("[MCP] Fatal error:", error);
  process.exit(1);
});
