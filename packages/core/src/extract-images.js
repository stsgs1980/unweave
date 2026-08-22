/**
 * @file Image extraction helpers for Playwright
 */

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
    { timeout: 30000 },
  );
}
