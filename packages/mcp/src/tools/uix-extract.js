import { extract } from "@unweave/core";

export const uixExtractTool = {
  name: "uix_extract",
  description: "Extract UI data from URL (DOM, styles, CSS variables, screenshots)",
  inputSchema: {
    type: "object",
    properties: {
      url: { type: "string", description: "URL to extract from" },
      screenshot: { type: "boolean", default: false },
      screenshotTypes: { type: "array", items: { type: "string" }, default: ["viewport"] },
      viewport: {
        type: "object",
        properties: { width: { type: "number" }, height: { type: "number" } },
      },
    },
    required: ["url"],
  },
  handler: async (args) => {
    const data = await extract(args.url, {
      screenshot: args.screenshot,
      screenshotTypes: args.screenshotTypes,
      viewport: args.viewport,
    });
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  },
};
