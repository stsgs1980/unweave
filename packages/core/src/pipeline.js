import { extract, extractMultiple } from './extract.js';
import { analyze } from './analyze.js';
import { generateSpec } from './spec.js';
import { generate } from './generate.js';
import fs from 'fs/promises';
import path from 'path';

/**
 * Full pipeline: extract -> analyze -> spec -> generate
 * @param {string|string[]} urls - URL or array of URLs
 * @param {Object} options - Pipeline options
 * @returns {Promise<Object>} Pipeline results
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
 * @returns {Promise<Object>} Generated code
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
 * Save reference to catalog
 * @param {string} name - Reference name
 * @param {Object} data - Reference data
 * @returns {Promise<string>} Saved reference path
 */
export async function saveReference(name, data) {
  const dir = path.join(process.cwd(), 'references');
  await fs.mkdir(dir, { recursive: true });

  const filePath = path.join(dir, `${name}.json`);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));

  return filePath;
}

/**
 * Load reference from catalog
 * @param {string} name - Reference name
 * @returns {Promise<Object|null>} Reference data or null
 */
export async function loadReference(name) {
  const filePath = path.join(process.cwd(), 'references', `${name}.json`);

  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content);
  } catch {
    return null;
  }
}

/**
 * List all saved references
 * @returns {Promise<string[]>} Reference names
 */
export async function listReferences() {
  const dir = path.join(process.cwd(), 'references');

  try {
    const files = await fs.readdir(dir);
    return files.filter((f) => f.endsWith('.json')).map((f) => f.replace('.json', ''));
  } catch {
    return [];
  }
}

/**
 * Compare two URLs
 * @param {string} url1 - First URL
 * @param {string} url2 - Second URL
 * @returns {Promise<Object>} Comparison results
 */
export async function compare(url1, url2) {
  const [extracted1, extracted2] = await extractMultiple([url1, url2]);
  const analysis1 = analyze(extracted1);
  const analysis2 = analyze(extracted2);

  return {
    url1,
    url2,
    designSystemDiff: diffDesignSystems(analysis1.designSystem, analysis2.designSystem),
    componentDiff: diffComponents(analysis1.components, analysis2.components),
    patternDiff: diffPatterns(analysis1.patterns, analysis2.patterns),
  };
}

/**
 *
 * @param name
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

/**
 *
 * @param ds1
 * @param ds2
 */
function diffDesignSystems(ds1, ds2) {
  if (!ds1 || !ds2) return { error: 'Missing design system data' };

  return {
    colors: diffArrays(ds1.colors?.all || [], ds2.colors?.all || []),
    spacing: diffArrays(ds1.spacing?.all || [], ds2.spacing?.all || []),
    radius: diffArrays(ds1.radius?.all || [], ds2.radius?.all || []),
    typography: {
      fonts: diffArrays(ds1.typography?.fonts || [], ds2.typography?.fonts || []),
      sizes: diffArrays(ds1.typography?.fontSizes || [], ds2.typography?.fontSizes || []),
    },
  };
}

/**
 *
 * @param comp1
 * @param comp2
 */
function diffComponents(comp1, comp2) {
  const types1 = new Set((comp1 || []).map((c) => c.type));
  const types2 = new Set((comp2 || []).map((c) => c.type));

  return {
    onlyInFirst: [...types1].filter((t) => !types2.has(t)),
    onlyInSecond: [...types2].filter((t) => !types1.has(t)),
    common: [...types1].filter((t) => types2.has(t)),
  };
}

/**
 *
 * @param p1
 * @param p2
 */
function diffPatterns(p1, p2) {
  const keys = new Set([...Object.keys(p1 || {}), ...Object.keys(p2 || {})]);
  const diff = {};

  for (const key of keys) {
    const v1 = p1?.[key] || 0;
    const v2 = p2?.[key] || 0;
    if (v1 !== v2) {
      diff[key] = { first: v1, second: v2, diff: v2 - v1 };
    }
  }

  return diff;
}

/**
 *
 * @param arr1
 * @param arr2
 */
function diffArrays(arr1, arr2) {
  const set1 = new Set(arr1);
  const set2 = new Set(arr2);

  return {
    onlyInFirst: [...set1].filter((x) => !set2.has(x)),
    onlyInSecond: [...set2].filter((x) => !set1.has(x)),
    common: [...set1].filter((x) => set2.has(x)),
  };
}
