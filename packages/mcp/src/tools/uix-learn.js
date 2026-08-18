import { pipeline } from "@unweave/core";

export const uixLearnTool = {
  name: "uix_learn",
  description: "Learn and save a site as reference for future use",
  inputSchema: {
    type: "object",
    properties: {
      url: { type: "string", description: "URL to learn" },
      save: { type: "string", description: "Reference name" },
      component: { type: "string", description: "Component name to include" },
      componentType: { type: "string" },
      format: { type: "string", enum: ["react", "vue", "html"] },
      typescript: { type: "boolean", default: true },
    },
    required: ["url", "save"],
  },
  handler: async (args) => {
    const results = await pipeline([args.url], {
      component: args.component,
      componentType: args.componentType,
      format: args.format,
      typescript: args.typescript,
      learn: args.save,
    });
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            { success: true, reference: args.save, result: results[0] },
            null,
            2,
          ),
        },
      ],
    };
  },
};
