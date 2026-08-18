import { program } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { pipeline } from '@unweave/core';
import fs from 'fs/promises';
import path from 'path';

/**
 * Регистрирует команду `pipeline` в CLI для полного цикла извлечения UI
 * из одного или нескольких URL (extract -> analyze -> spec -> generate).
 * Поддерживает опциональное сохранение референса и вывод файлов в директорию.
 * @returns {void} Ничего не возвращает, регистрирует команду в program
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
    .action(handlePipelineAction);
}

/**
 * Обработчик команды pipeline. Запускает полный цикл и выводит результат в консоль.
 * @param {string[]} urls - Список URL для обработки
 * @param {Object} options - Опции команды от commander
 * @param {string} [options.component] - Имя компонента для spec
 * @param {string} [options.type] - Тип компонента
 * @param {string} [options.format] - Формат вывода (react, vue, html)
 * @param {boolean} [options.ts] - Использовать TypeScript
 * @param {boolean} [options.screenshot] - Делать скриншоты
 * @param {string} options.screenshotTypes - Типы скриншотов через запятую
 * @param {string} [options.learn] - Имя для сохранения референса
 * @param {string} [options.output] - Директория для сохранения файлов
 * @returns {Promise<void>} Promise, разрешающийся после завершения
 */
async function handlePipelineAction(urls, options) {
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

    if (options.output) {
      await saveGeneratedOutput(results, options.output);
    }

    printSummary(results);
  } catch (error) {
    spinner.fail('Pipeline failed');
    const message = error instanceof Error ? error.message : String(error);
    console.error(chalk.red(message));
    process.exit(1);
  }
}

/**
 * Сохраняет сгенерированные файлы в указанную директорию.
 * @param {Array<Object>} results - Результаты пайплайна
 * @param {string} outputDir - Путь к директории для сохранения
 * @returns {Promise<void>} Promise, разрешающийся после записи всех файлов
 */
async function saveGeneratedOutput(results, outputDir) {
  await fs.mkdir(outputDir, { recursive: true });

  for (const result of results) {
    if (!result.generated) continue;

    for (const [filename, content] of Object.entries(result.generated)) {
      const filePath = path.join(outputDir, filename);
      await fs.writeFile(filePath, content);
    }
  }

  console.log(chalk.green(`Output saved to ${outputDir}`));
}

/**
 * Выводит сводку результатов пайплайна по каждому URL.
 * @param {Array<Object>} results - Результаты пайплайна
 * @param {string} results[].url - URL обработанного сайта
 * @param {boolean} results[].success - Успешность обработки
 * @param {string} [results[].error] - Сообщение об ошибке (если success === false)
 * @param {Object} [results[].analysis] - Результат анализа
 * @param {Object} [results[].analysis.stats] - Статистика анализа
 * @param {Object} [results[].generated] - Сгенерированные файлы
 * @param {string} [results[].reference] - Путь сохранённого референса
 * @returns {void}
 */
function printSummary(results) {
  for (const result of results) {
    console.log(chalk.cyan(`\n--- ${result.url} ---`));

    if (!result.success) {
      console.log(chalk.red(`[FAIL] Failed: ${result.error}`));
      continue;
    }

    console.log(chalk.green('[OK] Success'));

    if (result.analysis?.stats) {
      const { totalElements, uniqueColors, uniqueSpacing } = result.analysis.stats;
      console.log(`  Elements: ${totalElements}`);
      console.log(`  Colors: ${uniqueColors}`);
      console.log(`  Spacing: ${uniqueSpacing}`);
    }

    if (result.generated) {
      const names = Object.keys(result.generated).join(', ');
      console.log(chalk.green(`  Generated: ${names}`));
    }

    if (result.reference) {
      console.log(chalk.green(`  Reference saved: ${result.reference}`));
    }
  }
}
