/**
 * @file DOM element extraction for Playwright
 */

import { chromium } from "playwright";
import { isVisibleElement, SKIP_TAGS } from "./extract-visibility.js";
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
    (limit) => {
      const getComputedStyles = (element) => {
        const styles = window.getComputedStyle(element);
        const result = {};
        for (const prop of RELEVANT_CSS_PROPERTIES) {
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
        if (isVisibleElement(el, styles)) {
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
    maxElements,
    { timeout: 30000 },
  );
}

/**
 *
 * @param element
 */
function getComputedStyles(element) {
  const styles = window.getComputedStyle(element);
  const result = {};
  for (const prop of [
    "display",
    "position",
    "top",
    "right",
    "bottom",
    "left",
    "z-index",
    "flex",
    "flex-direction",
    "flex-wrap",
    "flex-grow",
    "flex-shrink",
    "flex-basis",
    "justify-content",
    "align-items",
    "align-content",
    "gap",
    "grid",
    "grid-template-columns",
    "grid-template-rows",
    "grid-gap",
    "float",
    "clear",
    "width",
    "height",
    "min-width",
    "min-height",
    "max-width",
    "max-height",
    "margin",
    "margin-top",
    "margin-right",
    "margin-bottom",
    "margin-left",
    "padding",
    "padding-top",
    "padding-right",
    "padding-bottom",
    "padding-left",
    "box-sizing",
    "overflow",
    "overflow-x",
    "overflow-y",
    "border",
    "border-width",
    "border-style",
    "border-color",
    "border-top",
    "border-right",
    "border-bottom",
    "border-left",
    "border-radius",
    "border-top-left-radius",
    "border-top-right-radius",
    "border-bottom-right-radius",
    "border-bottom-left-radius",
    "background",
    "background-color",
    "background-image",
    "background-size",
    "background-position",
    "background-repeat",
    "background-origin",
    "background-clip",
    "color",
    "font",
    "font-family",
    "font-size",
    "font-weight",
    "font-style",
    "font-variant",
    "line-height",
    "letter-spacing",
    "text-align",
    "text-decoration",
    "text-transform",
    "white-space",
    "word-wrap",
    "word-break",
    "overflow-wrap",
    "text-overflow",
    "vertical-align",
    "opacity",
    "visibility",
    "filter",
    "backdrop-filter",
    "mix-blend-mode",
    "box-shadow",
    "text-shadow",
    "transition",
    "transition-property",
    "transition-duration",
    "transition-timing-function",
    "transition-delay",
    "animation",
    "animation-name",
    "animation-duration",
    "animation-timing-function",
    "animation-delay",
    "cursor",
    "pointer-events",
    "user-select",
    "fill",
    "stroke",
    "stroke-width",
    "stroke-linecap",
    "stroke-linejoin",
  ]) {
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
}
