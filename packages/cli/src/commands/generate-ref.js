import { program } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { pipelineFromReference } from '@unweave/core';
import fs from 'fs/promises';
import path from 'path';

/**
 *
 */
export function registerGenerateRefCommand() {
  program
    .command('generate-ref <name>')
    .description('Generate component code from saved reference')
    .requiredOption('-f, --format <format>', 'Output format (react, vue, html)')
    .option('--ts', 'Use TypeScript', true)
    .option('-o, --output <dir>', 'Output directory')
    .action(async (name, options) => {
      const spinner = ora('Generating from reference...').start();

      try {
        const generated = await pipelineFromReference(name, {
          format: options.format,
          typescript: options.ts,
        });

        spinner.succeed('Code generated');

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
        spinner.fail('Generation failed');
        console.error(chalk.red(error.message));
        process.exit(1);
      }
    });
}
