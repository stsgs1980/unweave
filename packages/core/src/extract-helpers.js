/**
 * @file Helper functions for Playwright extraction
 */

import { chromium } from "playwright";

/**
 * Normalizes viewport options into Playwright width/height object.
 * @param {string|Object} [viewport] - Viewport mode name or dimensions object
 * @returns {{width: number, height: number}}
 */
export function normalizeViewport(viewport) {
  if (!viewport) return { width: 1280, height: 720 };
  if (typeof viewport === "object" && viewport.width && viewport.height) {
    return { width: Number(viewport.width), height: Number(viewport.height) };
  }
  if (typeof viewport === "string") {
    const v = viewport.toLowerCase().trim();
    if (v === "mobile") return { width: 375, height: 667 };
    if (v === "tablet") return { width: 768, height: 1024 };
    if (v === "desktop") return { width: 1280, height: 720 };
    if (v.includes("x")) {
      const parts = v.split("x").map(Number);
      if (parts[0] && parts[1]) return { width: parts[0], height: parts[1] };
    }
  }
  return { width: 1280, height: 720 };
}

/**
 * Default limits for extraction
 * @type {Object}
 */
export const EXTRACTION_LIMITS = {
  maxElements: 500,
  evaluateTimeout: 30000,
};

/**
 * Extract CSS variables from documentElement
 * @param {Page} page - Playwright page
 * @returns {Promise<Object<string, string>>}
 */
export async function extractCSSVariables(page) {
  return page.evaluate(
    () => {
      const variables = {};
      const styles = window.getComputedStyle(document.documentElement);
      for (const [key, value] of Object.entries(styles)) {
        if (key.startsWith("--")) {
          variables[key] = typeof value === "string" ? value.trim() : "";
        }
      }
      return variables;
    },
    { timeout: EXTRACTION_LIMITS.evaluateTimeout },
  );
}

/**
 * Extract page meta information
 * @param {Page} page - Playwright page
 * @returns {Promise<Object>}
 */
export async function extractPageMeta(page) {
  return page.evaluate(
    () => ({
      url: window.location.href,
      title: document.title,
      meta: {
        viewport: document.querySelector('meta[name="viewport"]')?.content,
        charset: document.characterSet,
        description: document.querySelector('meta[name="description"]')?.content,
      },
    }),
    { timeout: EXTRACTION_LIMITS.evaluateTimeout },
  );
}

/**
 * Extract elements with limited computed styles (batched for performance)
 * @param {Page} page - Playwright page
 * @param {number} maxElements - Maximum number of elements to extract
 * @returns {Promise<Array>}
 */
export async function extractElements(page, maxElements = EXTRACTION_LIMITS.maxElements) {
  return page.evaluate(
    (limit) => {
      const getComputedStyles = (element) => {
        const styles = window.getComputedStyle(element);
        const result = {};
        for (let i = 0; i < styles.length; i++) {
          const prop = styles[i];
          result[prop] = styles.getPropertyValue(prop);
        }
        return result;
      };

      const elements = document.querySelectorAll("*");
      const limitedElements = Array.from(elements).slice(0, limit);
      return limitedElements.map((el) => {
        const rect = el.getBoundingClientRect();
        return {
          tagName: el.tagName.toLowerCase(),
          id: el.id || null,
          className: el.className || null,
          attributes: Array.from(el.attributes).reduce((acc, attr) => {
            acc[attr.name] = attr.value;
            return acc;
          }, {}),
          computedStyles: getComputedStyles(el),
          boundingRect:
            rect.width || rect.height
              ? {
                  x: rect.x,
                  y: rect.y,
                  width: rect.width,
                  height: rect.height,
                }
              : null,
          textContent:
            typeof el.textContent === "string" ? el.textContent.trim().slice(0, 200) : null,
        };
      });
    },
    maxElements,
    { timeout: EXTRACTION_LIMITS.evaluateTimeout },
  );
}

/**
 * Extract images from page
 * @param {Page} page - Playwright page
 * @returns {Promise<Array>}
 */
export async function extractImages(page) {
  return page.evaluate(
    () =>
      Array.from(document.images).map((img) => ({
        src: img.src,
        alt: img.alt,
        width: img.naturalWidth,
        height: img.naturalHeight,
      })),
    { timeout: EXTRACTION_LIMITS.evaluateTimeout },
  );
}
