import { chromium } from "playwright";

/**
 * Normalizes viewport options into Playwright width/height object.
 * @param {string|Object} [viewport] - Viewport mode name or dimensions object
 * @returns {{width: number, height: number}}
 */
function normalizeViewport(viewport) {
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
const EXTRACTION_LIMITS = {
  maxElements: 500,
  evaluateTimeout: 30000,
};

/**
 * Extract CSS variables from documentElement
 * @param {Page} page - Playwright page
 * @returns {Promise<Object<string, string>>}
 */
async function extractCSSVariables(page) {
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
async function extractPageMeta(page) {
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
async function extractElements(page, maxElements = EXTRACTION_LIMITS.maxElements) {
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
async function extractImages(page) {
  return (
    page.evaluate(() =>
      Array.from(document.images).map((img) => ({
        src: img.src,
        alt: img.alt,
        width: img.naturalWidth,
        height: img.naturalHeight,
      })),
    ),
    { timeout: EXTRACTION_LIMITS.evaluateTimeout }
  );
}

/**
 * Extract UI data from a URL using Playwright
 * @param {string} url - URL to extract from
 * @param {Object} options - Extraction options
 * @returns {Promise<Object>} Extracted data
 */
export async function extract(url, options = {}) {
  const maxElements = options.maxElements ?? EXTRACTION_LIMITS.maxElements;
  const browser = await chromium.launch({ headless: true });
  const viewportObj = normalizeViewport(options.viewport);
  const context = await browser.newContext({
    viewport: viewportObj,
    userAgent:
      options.userAgent ||
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
        "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  });

  const page = await context.newPage();

  const wantsScreenshots = Boolean(
    options.screenshot ||
    (options.screenshots &&
      typeof options.screenshots === "object" &&
      Object.values(options.screenshots).some(Boolean)),
  );

  // Block heavy resources ONLY if screenshots not requested.
  if (!wantsScreenshots) {
    await context.route(
      "**/*.{png,jpg,jpeg,gif,svg,webp,ico,mp4,webm,ogg,mp3,woff,woff2}",
      (route) => route.abort(),
    );
  }

  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });

    if (options.waitFor) {
      await page.waitForSelector(options.waitFor, { timeout: 10000 }).catch(() => {});
    }

    // Extract data in multiple smaller evaluations to avoid "Target crashed"
    let cssVariables = {};
    let pageMeta = { url: "", title: "", meta: {} };
    let elements = [];
    let images = [];

    // 1. CSS Variables (lightweight)
    try {
      cssVariables = await extractCSSVariables(page);
    } catch (e) {
      console.warn("[extract] CSS variables extraction failed:", e.message);
    }

    // 2. Page meta (lightweight)
    try {
      pageMeta = await extractPageMeta(page);
    } catch (e) {
      console.warn("[extract] Page meta extraction failed:", e.message);
    }

    // 3. Elements (heavy - limited count)
    try {
      elements = await extractElements(page, maxElements);
    } catch (e) {
      console.warn("[extract] Elements extraction failed:", e.message);
      // Fallback: try with fewer elements
      if (maxElements > 50) {
        try {
          elements = await extractElements(page, 50);
        } catch (e2) {
          console.error("[extract] Elements extraction failed even with limit:", e2.message);
        }
      }
    }

    // 4. Images (lightweight)
    try {
      images = await extractImages(page);
    } catch (e) {
      console.warn("[extract] Images extraction failed:", e.message);
    }

    const data = {
      ...pageMeta,
      cssVariables,
      elements,
      images,
    };

    // Screenshots if requested
    if (wantsScreenshots) {
      let types = options.screenshotTypes;
      if (!types && options.screenshots && typeof options.screenshots === "object") {
        types = Object.entries(options.screenshots)
          .filter(([_, active]) => Boolean(active))
          .map(([key]) => key);
      }
      if (!types || types.length === 0) {
        types = ["viewport"];
      }

      data.screenshots = {};

      for (const type of types) {
        switch (type) {
          case "full":
          case "fullPage":
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
