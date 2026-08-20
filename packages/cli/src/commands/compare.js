import { program } from "commander";
import chalk from "chalk";
import ora from "ora";
import { compare } from "@unweave/core";
import fs from "fs/promises";
import path from "path";

/**
 * Validates whether the given string is a valid URL.
 * @param {string} url - The URL string to validate.
 * @returns {boolean} True if valid, false otherwise.
 */
function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Ensures that the directory for the given file path exists.
 * @param {string} filePath - The target file path.
 * @returns {Promise<void>}
 */
async function ensureDir(filePath) {
  const dir = path.dirname(filePath);
  await fs.mkdir(dir, { recursive: true });
}

/**
 * Registers the compare command with Commander.
 */
export function registerCompareCommand() {
  program
    .command("compare <url1> <url2>")
    .description("Compare two URLs")
    .option("-o, --output <file>", "Output JSON file")
    .action(async (url1, url2, options) => {
      if (!isValidUrl(url1) || !isValidUrl(url2)) {
        console.error(chalk.red("Error: Both arguments must be valid URLs"));
        process.exit(1);
      }

      const spinner = ora("Comparing...").start();

      try {
        const comparison = await Promise.race([
          compare(url1, url2),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Comparison timed out after 120s")), 120000),
          ),
        ]);

        spinner.succeed("Comparison completed");

        if (options.output) {
          await ensureDir(options.output);
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
