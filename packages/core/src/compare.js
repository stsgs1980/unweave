import { extractMultiple } from "./extract.js";
import { analyze } from "./analyze.js";

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
 * @param {Object} ds1 - First design system
 * @param {Object} ds2 - Second design system
 * @returns {Object} Design system diff
 */
function diffDesignSystems(ds1, ds2) {
  if (!ds1 || !ds2) return { error: "Missing design system data" };

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
 * @param {Array} comp1 - First components array
 * @param {Array} comp2 - Second components array
 * @returns {Object} Components diff
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
 * @param {Object} p1 - First patterns object
 * @param {Object} p2 - Second patterns object
 * @returns {Object} Patterns diff
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
 * @param {Array} arr1 - First array
 * @param {Array} arr2 - Second array
 * @returns {Object} Array diff
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
