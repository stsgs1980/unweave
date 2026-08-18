import { program } from "commander";
import chalk from "chalk";
import { listReferences } from "@unweave/core";

/**
 *
 */
export function registerReferencesCommand() {
  program
    .command("references")
    .description("List saved references")
    .action(async () => {
      const refs = await listReferences();

      if (refs.length === 0) {
        console.log(chalk.yellow("No references saved"));
      } else {
        console.log(chalk.cyan("Saved references:"));
        for (const ref of refs) {
          console.log(`  - ${ref}`);
        }
      }
    });
}
