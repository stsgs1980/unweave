import { program } from "commander";
import chalk from "chalk";
import ora from "ora";
import { extract } from "@unweave/core";
import fs from "fs/promises";
import path from "path";

/**
 *
 */
export function registerScreenshotCommand() {
  program
    .command("screenshot <url>")
    .description("Take screenshots of a URL")
    .option(
      "--types <types>",
      "Screenshot types (full,viewport,mobile,sections,components)",
      "full,viewport",
    )
    .option("-o, --output <dir>", "Output directory")
    .action(async (url, options) => {
      const spinner = ora("Taking screenshots...").start();

      try {
        const data = await extract(url, {
          screenshot: true,
          screenshotTypes: options.types.split(","),
        });

        spinner.succeed("Screenshots taken");

        if (options.output && data.screenshots) {
          await fs.mkdir(options.output, { recursive: true });
          for (const [type, buffer] of Object.entries(data.screenshots)) {
            await fs.writeFile(path.join(options.output, `screenshot-${type}.png`), buffer);
          }
          console.log(chalk.green(`Saved to ${options.output}`));
        }
      } catch (error) {
        spinner.fail("Screenshot failed");
        console.error(chalk.red(error.message));
        process.exit(1);
      }
    });
}
