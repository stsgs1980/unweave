import { program } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { pipeline } from '@unweave/core';
import fs from 'fs/promises';
import path from 'path';

/**
 *
 */
export function registerPipelineCommand() {
  program
    .command('pipeline <urls...>')
    .description('Full pipeline: extract + analyze + spec + generate')
    .option('-c, --component <name>', 'Component name to generate spec for')
    .option('-t, --type <type>', 'Component type (button, input, card, modal, navigation)')
    .option('-f, --format <format>', 'Output format (react, vue, html)')
    .option('--ts', 'Use TypeScript', true)
    .option('-s, --screenshot', 'Take screenshots')
    .option(
      '--screenshot-types <types>',
      'Screenshot types (full,viewport,mobile,sections,components)',
      'viewport',
    )
    .option('-l, --learn <name>', 'Save as reference with given name')
    .option('-o, --output <dir>', 'Output directory')
    .action(async (urls, options) => {
      const spinner = ora('Running pipeline...').start();

      try {
        const results = await pipeline(urls, {
          component: options.component,
          componentType: options.type,
          format: options.format,
          typescript: options.ts,
          screenshot: options.screenshot,
          screenshotTypes: options.screenshotTypes.split(','),
          learn: options.learn,
        });

        spinner.succeed('Pipeline completed');

        // Save output if requested
        if (options.output) {
          await fs.mkdir(options.output, { recursive: true });
          for (const result of results) {
            if (result.generated) {
              for (const [filename, content] of Object.entries(result.generated)) {
                await fs.writeFile(path.join(options.output, filename), content);
              }
            }
          }
          console.log(chalk.green(`Output saved to ${options.output}`));
        }

        // Print summary
        for (const result of results) {
          console.log(chalk.cyan(`\n--- ${result.url} ---`));
          if (result.success) {
            console.log(chalk.green('[OK] Success'));
            if (result.analysis?.stats) {
              console.log(`  Elements: ${result.analysis.stats.totalElements}`);
              console.log(`  Colors: ${result.analysis.stats.uniqueColors}`);
              console.log(`  Spacing: ${result.analysis.stats.uniqueSpacing}`);
            }
            if (result.generated) {
              console.log(chalk.green(`  Generated: ${Object.keys(result.generated).join(', ')}`));
            }
            if (result.reference) {
              console.log(chalk.green(`  Reference saved: ${result.reference}`));
            }
          } else {
            console.log(chalk.red('[FAIL] Failed: ${result.error}'));
          }
        }
      } catch (error) {
        spinner.fail('Pipeline failed');
        console.error(chalk.red(error.message));
        process.exit(1);
      }
    });
}
