import { program } from "commander";
import chalk from "chalk";
import ora from "ora";
import { compare } from "@unweave/core";
import fs from "fs/promises";

/**
 *
 */
export function registerCompareCommand() {
  program
    .command("compare <url1> <url2>")
    .description("Compare two URLs")
    .option("-o, --output <file>", "Output JSON file")
    .action(async (url1, url2, options) => {
      const spinner = ora("Comparing...").start();

      try {
        const comparison = await compare(url1, url2);

        spinner.succeed("Comparison completed");

        if (options.output) {
          await fs.writeFile(options.output, JSON.stringify(comparison, null, 2));
          console.log(chalk.green(`Saved to ${options.output}`));
        } else {
          console.log(JSON.stringify(comparison, null, 2));
        }
      } catch (error) {
        spinner.fail("Comparison failed");
        console.error(chalk.red(error.message));
        process.exit(1);
      }
    });
}
