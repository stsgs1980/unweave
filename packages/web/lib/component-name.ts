/**
 * @file Derivation of a component name from an extraction source URL.
 */

const FALLBACK_NAME = "ExtractedPage";

/**
 * Builds a PascalCase component name from a URL hostname.
 * @param {string} url - The extraction source URL.
 * @returns {string} A PascalCase component name, or a fallback when no host resolves.
 */
export function deriveComponentName(url: string): string {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    const label = host.split(".")[0].split("-")[0];
    if (!label) return FALLBACK_NAME;
    return label.charAt(0).toUpperCase() + label.slice(1).toLowerCase();
  } catch {
    return FALLBACK_NAME;
  }
}
