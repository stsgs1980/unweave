/**
 * @file DOM element extraction for Playwright
 */

import { chromium } from "playwright";
import { SKIP_TAGS } from "./extract-visibility.js";
import { RELEVANT_CSS_PROPERTIES } from "./extract-css.js";

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
    { timeout: 30000 },
  );
}

/**
 * Extract elements with limited computed styles (batched for performance)
 * @param {Page} page - Playwright page
 * @param {number} maxElements - Maximum number of VISIBLE elements to extract
 * @returns {Promise<Array>}
 */
export async function extractElements(page, maxElements = 500) {
  return page.evaluate(
    ({ limit, relevantProps, skipTags }) => {
      const isVisible = (el, styles) => {
        const tagName = el.tagName.toLowerCase();

        if (skipTags.includes(tagName)) {
          return false;
        }

        const display = styles.getPropertyValue("display");
        const visibility = styles.getPropertyValue("visibility");
        const opacity = styles.getPropertyValue("opacity");

        if (display === "none" || visibility === "hidden" || opacity === "0" || opacity === "0.0") {
          return false;
        }

        const rect = el.getBoundingClientRect();
        if (rect.width === 0 && rect.height === 0) {
          return false;
        }

        const width = styles.getPropertyValue("width");
        const height = styles.getPropertyValue("height");
        if ((width === "0px" || width === "0") && (height === "0px" || height === "0")) {
          return false;
        }

        return true;
      };

      const getComputedStyles = (element) => {
        const styles = window.getComputedStyle(element);
        const result = {};
        for (const prop of relevantProps) {
          const value = styles.getPropertyValue(prop);
          if (
            value &&
            value !== "none" &&
            value !== "0px" &&
            value !== "0" &&
            value !== "normal" &&
            value !== "auto"
          ) {
            result[prop] = value;
          }
        }
        return result;
      };

      // Get ALL elements first, then filter for visible ones BEFORE slicing
      const allElements = Array.from(document.querySelectorAll("*"));
      const visibleElements = [];

      for (const el of allElements) {
        const styles = window.getComputedStyle(el);
        if (isVisible(el, styles)) {
          visibleElements.push(el);
          if (visibleElements.length >= limit) break;
        }
      }

      return visibleElements.map((el) => {
        const styles = window.getComputedStyle(el);
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
    { limit: maxElements, relevantProps: RELEVANT_CSS_PROPERTIES, skipTags: SKIP_TAGS },
  );
}
