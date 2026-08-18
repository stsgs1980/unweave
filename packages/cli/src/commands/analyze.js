import { program } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { extract, analyze } from '@unweave/core';
import fs from 'fs/promises';

/**
 *
 */
export function registerAnalyzeCommand() {
  program
    .command('analyze <url>')
    .description('Analyze patterns and design system from URL')
    .option('-o, --output <file>', 'Output JSON file')
    .action(async (url, options) => {
      const spinner = ora('Analyzing...').start();

      try {
        const extracted = await extract(url);
        const analysis = analyze(extracted);

        spinner.succeed('Analysis completed');

        if (options.output) {
          await fs.writeFile(options.output, JSON.stringify(analysis, null, 2));
          console.log(chalk.green(`Saved to ${options.output}`));
        } else {
          console.log(JSON.stringify(analysis, null, 2));
        }
      } catch (error) {
        spinner.fail('Analysis failed');
        console.error(chalk.red(error.message));
        process.exit(1);
      }
    });
}
