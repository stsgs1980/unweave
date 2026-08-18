import { program } from "commander";
import chalk from "chalk";
import ora from "ora";
import { extract, analyze, generateSpec, generate } from "@unweave/core";
import fs from "fs/promises";
import path from "path";

/**
 *
 */
export function registerGenerateCommand() {
  program
    .command("generate <url>")
    .description("Generate component code from URL")
    .requiredOption("-c, --component <name>", "Component name")
    .requiredOption("-f, --format <format>", "Output format (react, vue, html)")
    .option("-t, --type <type>", "Component type")
    .option("--ts", "Use TypeScript", true)
    .option("-o, --output <dir>", "Output directory")
    .action(async (url, options) => {
      const spinner = ora("Generating code...").start();

      try {
        const extracted = await extract(url);
        const analysis = analyze(extracted);
        const spec = generateSpec(analysis, {
          componentName: options.component,
          componentType: options.type,
          source: url,
        });
        const generated = generate(spec, {
          format: options.format,
          typescript: options.ts,
        });

        spinner.succeed("Code generated");

        if (options.output) {
          await fs.mkdir(options.output, { recursive: true });
          for (const [filename, content] of Object.entries(generated)) {
            await fs.writeFile(path.join(options.output, filename), content);
          }
          console.log(chalk.green(`Saved to ${options.output}`));
        } else {
          for (const [filename, content] of Object.entries(generated)) {
            console.log(chalk.cyan(`\n--- ${filename} ---`));
            console.log(content);
          }
        }
      } catch (error) {
        spinner.fail("Code generation failed");
        console.error(chalk.red(error.message));
        process.exit(1);
      }
    });
}
