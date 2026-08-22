import { chromium } from "playwright";
import {
  normalizeViewport,
  EXTRACTION_LIMITS,
  extractCSSVariables,
  extractPageMeta,
  extractElements,
  extractImages,
} from "./extract-helpers.js";

/**
 * Extract UI data from a URL using Playwright
 * @param {string} url - URL to extract from
 * @param {Object} options - Extraction options
 * @returns {Promise<Object>} Extracted data
 */
export async function extract(url, options = {}) {
  const maxElements = options.maxElements ?? EXTRACTION_LIMITS.maxElements;
  const extractionPhases = options.extractionPhases ?? {
    cssVariables: true,
    pageMeta: true,
    elements: true,
    images: true,
  };
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
    if (extractionPhases.cssVariables) {
      try {
        cssVariables = await extractCSSVariables(page);
      } catch (e) {
        console.warn("[extract] CSS variables extraction failed:", e.message);
      }
    }

    // 2. Page meta (lightweight)
    if (extractionPhases.pageMeta) {
      try {
        pageMeta = await extractPageMeta(page);
      } catch (e) {
        console.warn("[extract] Page meta extraction failed:", e.message);
      }
    }

    // 3. Elements (heavy - limited count)
    if (extractionPhases.elements) {
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
    }

    // 4. Images (lightweight)
    if (extractionPhases.images) {
      try {
        images = await extractImages(page);
      } catch (e) {
        console.warn("[extract] Images extraction failed:", e.message);
      }
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
        try {
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
            default:
              console.warn(`[extract] Unknown screenshot type: ${type}`);
          }
        } catch (e) {
          console.warn(`[extract] Screenshot "${type}" failed:`, e.message);
          // Don't throw - preserve other screenshots and extracted data
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
