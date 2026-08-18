import { program } from "commander";
import chalk from "chalk";
import ora from "ora";
import { extract } from "@unweave/core";
import fs from "fs/promises";

/**
 *
 */
export function registerExtractCommand() {
  program
    .command("extract <url>")
    .description("Extract UI data from URL")
    .option("-s, --screenshot", "Take screenshots")
    .option("--screenshot-types <types>", "Screenshot types", "viewport")
    .option("-o, --output <file>", "Output JSON file")
    .action(async (url, options) => {
      const spinner = ora("Extracting...").start();

      try {
        const data = await extract(url, {
          screenshot: options.screenshot,
          screenshotTypes: options.screenshotTypes.split(","),
        });

        spinner.succeed("Extraction completed");

        if (options.output) {
          await fs.writeFile(options.output, JSON.stringify(data, null, 2));
          console.log(chalk.green(`Saved to ${options.output}`));
        } else {
          console.log(JSON.stringify(data, null, 2));
        }
      } catch (error) {
        spinner.fail("Extraction failed");
        console.error(chalk.red(error.message));
        process.exit(1);
      }
    });
}
