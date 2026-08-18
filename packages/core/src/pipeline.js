import { extract } from './extract.js';
import { analyze } from './analyze.js';
import { generateSpec } from './spec.js';
import { generate } from './generate.js';
import { saveReference, loadReference } from './references.js';
import { compare } from './compare.js';

/**
 * Full pipeline: extract -> analyze -> spec -> generate
 * @param {string|string[]} urls - URL or array of URLs
 * @param {Object} options - Pipeline options
 * @param {boolean} [options.screenshot] - Take screenshot
 * @param {string[]} [options.screenshotTypes] - Screenshot types
 * @param {Object} [options.viewport] - Viewport settings
 * @param {number} [options.waitFor] - Wait time in ms
 * @param {string} [options.component] - Component name
 * @param {string} [options.componentType] - Component type
 * @param {string} [options.format] - Output format
 * @param {boolean} [options.typescript] - Use TypeScript
 * @param {string} [options.learn] - Save as reference name
 * @returns {Promise<Array>} Pipeline results
 */
export async function pipeline(urls, options = {}) {
  const urlArray = Array.isArray(urls) ? urls : [urls];
  const results = [];

  for (const url of urlArray) {
    try {
      console.log(`[pipeline] Processing: ${url}`);

      // Step 1: Extract
      console.log('[pipeline] Extracting...');
      const extracted = await extract(url, {
        screenshot: options.screenshot,
        screenshotTypes: options.screenshotTypes,
        viewport: options.viewport,
        waitFor: options.waitFor,
      });

      // Step 2: Analyze
      console.log('[pipeline] Analyzing...');
      const analysis = analyze(extracted);

      // Step 3: Generate spec (if component specified)
      let spec = null;
      if (options.component) {
        console.log('[pipeline] Generating spec...');
        spec = generateSpec(analysis, {
          componentName: options.component,
          componentType: options.componentType || inferComponentType(options.component),
          source: url,
        });
      }

      // Step 4: Generate code (if format specified)
      let generated = null;
      if (options.format && spec) {
        console.log('[pipeline] Generating code...');
        generated = generate(spec, {
          format: options.format,
          typescript: options.typescript,
        });
      }

      // Step 5: Save to reference catalog (if learn option)
      let reference = null;
      if (options.learn) {
        console.log('[pipeline] Learning reference...');
        reference = await saveReference(options.learn, {
          url,
          extracted,
          analysis,
          spec,
          generated,
          timestamp: new Date().toISOString(),
        });
      }

      results.push({
        url,
        success: true,
        extracted,
        analysis,
        spec,
        generated,
        reference,
      });

      console.log(`[pipeline] Completed: ${url}`);
    } catch (error) {
      console.error(`[pipeline] Failed: ${url}`, error);
      results.push({
        url,
        success: false,
        error: error.message,
      });
    }
  }

  return results;
}

/**
 * Run pipeline with saved reference
 * @param {string} referenceName - Name of saved reference
 * @param {Object} options - Generation options
 * @param {string} [options.format] - Output format
 * @param {boolean} [options.typescript] - Use TypeScript
 * @returns {Promise<Object>} Generated code or reference data
 */
export async function pipelineFromReference(referenceName, options = {}) {
  const reference = await loadReference(referenceName);
  if (!reference) {
    throw new Error(`Reference not found: ${referenceName}`);
  }

  if (options.format && reference.spec) {
    return generate(reference.spec, {
      format: options.format,
      typescript: options.typescript,
    });
  }

  return reference;
}

/**
 * Infer component type from name
 * @param {string} name - Component name
 * @returns {string} Inferred component type
 */
function inferComponentType(name) {
  const lower = name.toLowerCase();
  if (lower.includes('btn') || lower.includes('button')) return 'button';
  if (lower.includes('input') || lower.includes('field')) return 'input';
  if (lower.includes('card')) return 'card';
  if (lower.includes('modal') || lower.includes('dialog')) return 'modal';
  if (lower.includes('nav') || lower.includes('menu')) return 'navigation';
  return 'generic';
}

// Re-export for backward compatibility
export { compare };
