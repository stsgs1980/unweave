import { extract, extractMultiple } from "./extract.js";
import { analyze } from "./analyze.js";
import { generateSpec } from "./spec.js";
import { generate } from "./generate.js";
import fs from "fs/promises";
import path from "path";
import { diffDesignSystems, diffComponents, diffPatterns } from "./diff.js";

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
 * @param {Function} [onProgress] - Callback for progress updates (progress, message)
 * @returns {Promise<Array>} Pipeline results
 */
export async function pipeline(urls, options = {}, onProgress) {
  const urlArray = Array.isArray(urls) ? urls : [urls];
  const results = [];

  for (const url of urlArray) {
    const pipelineStart = Date.now();
    try {
      console.log(`[pipeline] Processing: ${url}`);
      if (onProgress) onProgress(0, "Starting pipeline...");

      // Step 1: Extract
      const extractStart = Date.now();
      if (onProgress) onProgress(10, "Extracting components...");
      console.log("[pipeline] Extracting...");
      const extracted = await extract(url, {
        screenshot: options.screenshot,
        screenshotTypes: options.screenshotTypes,
        viewport: options.viewport,
        waitFor: options.waitFor,
        extractionPhases: options.extractionPhases,
      });
      const extractTime = Date.now() - extractStart;
      console.log(`[pipeline] Extract completed in ${extractTime}ms`);

      // Step 2: Analyze
      const analyzeStart = Date.now();
      if (onProgress) onProgress(40, "Analyzing design system...");
      console.log("[pipeline] Analyzing...");
      const analysis = analyze(extracted);
      const analyzeTime = Date.now() - analyzeStart;
      console.log(`[pipeline] Analyze completed in ${analyzeTime}ms`);

      // Step 3: Generate spec (if component specified)
      let spec = null;
      if (options.component) {
        const specStart = Date.now();
        if (onProgress) onProgress(60, "Generating specification...");
        console.log("[pipeline] Generating spec...");
        spec = generateSpec(analysis, {
          componentName: options.component,
          componentType: options.componentType || inferComponentType(options.component),
          source: url,
        });
        const specTime = Date.now() - specStart;
        console.log(`[pipeline] Spec generated in ${specTime}ms`);
      }

      // Step 4: Generate code (if format specified)
      let generated = null;
      if (options.format && spec) {
        const generateStart = Date.now();
        if (onProgress) onProgress(80, "Generating code...");
        console.log("[pipeline] Generating code...");
        generated = generate(spec, {
          format: options.format,
          typescript: options.typescript,
        });
        const generateTime = Date.now() - generateStart;
        console.log(`[pipeline] Code generated in ${generateTime}ms`);
      }

      // Step 5: Save to reference catalog (if learn option)
      let reference = null;
      if (options.learn) {
        const refStart = Date.now();
        console.log("[pipeline] Learning reference...");
        reference = await saveReference(options.learn, {
          url,
          extracted,
          analysis,
          spec,
          generated,
          timestamp: new Date().toISOString(),
        });
        const refTime = Date.now() - refStart;
        console.log(`[pipeline] Reference saved in ${refTime}ms`);
      }

      const totalTime = Date.now() - pipelineStart;
      if (onProgress) onProgress(100, "Extraction completed");
      console.log(`[pipeline] Completed: ${url} (total: ${totalTime}ms)`);

      results.push({
        url,
        success: true,
        extracted,
        analysis,
        spec,
        generated,
        reference,
        timing: {
          total: totalTime,
          extract: extractTime,
          analyze: analyzeTime,
          spec: specTime || 0,
          generate: generateTime || 0,
          reference: refTime || 0,
        },
      });
    } catch (error) {
      console.error(`[pipeline] Failed: ${url}`, error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;
      results.push({
        url,
        success: false,
        error: errorMessage,
        stack: errorStack,
      });
    }
  }

  return results;
}

/**
 * Run pipeline with saved reference
 * @param {string} referenceName - Name of saved reference
 * @param {Object} options - Generation options
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
 * Save reference to catalog
 * @param {string} name - Reference name
 * @param {Object} data - Reference data
 * @returns {Promise<string>} Saved reference path
 */
export async function saveReference(name, data) {
  const dir = path.join(process.cwd(), "references");
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
  const filePath = path.join(process.cwd(), "references", `${name}.json`);

  try {
    const content = await fs.readFile(filePath, "utf-8");
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
  const dir = path.join(process.cwd(), "references");

  try {
    const files = await fs.readdir(dir);
    return files.filter((f) => f.endsWith(".json")).map((f) => f.replace(".json", ""));
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
 * Определяет тип компонента по его имени
 * @param {string} name - Имя компонента (например, 'Button', 'Card', 'Modal')
 * @returns {'button' | 'input' | 'card' | 'modal' | 'navigation' | 'generic'} Тип компонента
 */
function inferComponentType(name) {
  const lower = name.toLowerCase();
  if (lower.includes("btn") || lower.includes("button")) return "button";
  if (lower.includes("input") || lower.includes("field")) return "input";
  if (lower.includes("card")) return "card";
  if (lower.includes("modal") || lower.includes("dialog")) return "modal";
  if (lower.includes("nav") || lower.includes("menu")) return "navigation";
  return "generic";
}
