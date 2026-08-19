import { chromium } from "playwright";

/**
 * Extract UI data from a URL using Playwright
 * @param {string} url - URL to extract from
 * @param {Object} options - Extraction options
 * @returns {Promise<Object>} Extracted data
 */
export async function extract(url, options = {}) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: options.viewport || { width: 1280, height: 720 },
    userAgent: options.userAgent,
  });
  const page = await context.newPage();

  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });

    // Wait for any additional settling
    if (options.waitFor) {
      await page.waitForSelector(options.waitFor, { timeout: 10000 }).catch(() => {});
    }

    // Extract DOM, styles, CSS variables, images
    const data = await page.evaluate(() => {
      const getComputedStyles = (element) => {
        const styles = window.getComputedStyle(element);
        const result = {};
        for (let i = 0; i < styles.length; i++) {
          const prop = styles[i];
          result[prop] = styles.getPropertyValue(prop);
        }
        return result;
      };

      const getCSSVariables = () => {
        const variables = {};
        const styles = getComputedStyles(document.documentElement);
        for (const [key, value] of Object.entries(styles)) {
          if (key.startsWith("--")) {
            variables[key] = value.trim();
          }
        }
        return variables;
      };

      const extractElements = (selector = "*") => {
        const elements = document.querySelectorAll(selector);
        return Array.from(elements).map((el) => ({
          tagName: el.tagName.toLowerCase(),
          id: el.id || null,
          className: el.className || null,
          attributes: Array.from(el.attributes).reduce((acc, attr) => {
            acc[attr.name] = attr.value;
            return acc;
          }, {}),
          computedStyles: getComputedStyles(el),
          boundingRect: el.getBoundingClientRect()
            ? {
                x: el.getBoundingClientRect().x,
                y: el.getBoundingClientRect().y,
                width: el.getBoundingClientRect().width,
                height: el.getBoundingClientRect().height,
              }
            : null,
          textContent: el.textContent?.trim().slice(0, 200) || null,
        }));
      };

      return {
        url: window.location.href,
        title: document.title,
        cssVariables: getCSSVariables(),
        elements: extractElements(),
        images: Array.from(document.images).map((img) => ({
          src: img.src,
          alt: img.alt,
          width: img.naturalWidth,
          height: img.naturalHeight,
        })),
        meta: {
          viewport: document.querySelector('meta[name="viewport"]')?.content,
          charset: document.charset,
          description: document.querySelector('meta[name="description"]')?.content,
        },
      };
    });

    // Screenshots if requested
    if (options.screenshot) {
      const types = options.screenshotTypes || ["viewport"];
      data.screenshots = {};

      for (const type of types) {
        switch (type) {
          case "full":
            data.screenshots.full = await page.screenshot({ fullPage: true, type: "png" });
            break;
          case "viewport":
            data.screenshots.viewport = await page.screenshot({ type: "png" });
            break;
          case "mobile":
            await page.setViewportSize({ width: 375, height: 667 });
            data.screenshots.mobile = await page.screenshot({ type: "png" });
            break;
        }
      }
    }

    return data;
  } finally {
    await browser.close();
  }
}

/**
 * Extract multiple URLs
 * @param {string[]} urls - URLs to extract
 * @param {Object} options - Extraction options
 * @returns {Promise<Object[]>} Array of extracted data
 */
export async function extractMultiple(urls, options = {}) {
  const results = [];
  for (const url of urls) {
    try {
      results.push(await extract(url, options));
    } catch (error) {
      results.push({ url, error: error.message });
    }
  }
  return results;
}
