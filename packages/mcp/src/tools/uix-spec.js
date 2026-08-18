import { extract, analyze, generateSpec } from "@unweave/core";

export const uixSpecTool = {
  name: "uix_spec",
  description: "Generate component specification from URL",
  inputSchema: {
    type: "object",
    properties: {
      url: { type: "string", description: "URL to analyze" },
      component: { type: "string", description: "Component name" },
      componentType: {
        type: "string",
        enum: ["button", "input", "card", "modal", "navigation", "generic"],
      },
    },
    required: ["url", "component"],
  },
  handler: async (args) => {
    const extracted = await extract(args.url);
    const analysis = analyze(extracted);
    const spec = generateSpec(analysis, {
      componentName: args.component,
      componentType: args.componentType,
      source: args.url,
    });
    return { content: [{ type: "text", text: JSON.stringify(spec, null, 2) }] };
  },
};
