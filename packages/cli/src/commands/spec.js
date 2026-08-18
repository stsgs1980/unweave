import { program } from "commander";
import chalk from "chalk";
import ora from "ora";
import { extract, analyze, generateSpec } from "@unweave/core";
import fs from "fs/promises";

/**
 *
 */
export function registerSpecCommand() {
  program
    .command("spec <url>")
    .description("Generate component specification from URL")
    .requiredOption("-c, --component <name>", "Component name")
    .option("-t, --type <type>", "Component type")
    .option("-o, --output <file>", "Output JSON file")
    .action(async (url, options) => {
      const spinner = ora("Generating spec...").start();

      try {
        const extracted = await extract(url);
        const analysis = analyze(extracted);
        const spec = generateSpec(analysis, {
          componentName: options.component,
          componentType: options.type,
          source: url,
        });

        spinner.succeed("Spec generated");

        if (options.output) {
          await fs.writeFile(options.output, JSON.stringify(spec, null, 2));
          console.log(chalk.green(`Saved to ${options.output}`));
        } else {
          console.log(JSON.stringify(spec, null, 2));
        }
      } catch (error) {
        spinner.fail("Spec generation failed");
        console.error(chalk.red(error.message));
        process.exit(1);
      }
    });
}
