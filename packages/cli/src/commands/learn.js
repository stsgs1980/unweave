import { program } from "commander";
import chalk from "chalk";
import ora from "ora";
import { pipeline } from "@unweave/core";

/**
 *
 */
export function registerLearnCommand() {
  program
    .command("learn <url>")
    .description("Learn and save a site as reference")
    .requiredOption("-s, --save <name>", "Reference name")
    .option("-c, --component <name>", "Component name to include in spec")
    .option("-t, --type <type>", "Component type")
    .option("-f, --format <format>", "Output format to include")
    .option("--ts", "Use TypeScript", true)
    .action(async (url, options) => {
      const spinner = ora("Learning...").start();

      try {
        await pipeline([url], {
          component: options.component,
          componentType: options.type,
          format: options.format,
          typescript: options.ts,
          learn: options.save,
        });

        spinner.succeed("Reference saved");
        console.log(chalk.green(`Reference "${options.save}" created`));
      } catch (error) {
        spinner.fail("Learn failed");
        console.error(chalk.red(error.message));
        process.exit(1);
      }
    });
}
