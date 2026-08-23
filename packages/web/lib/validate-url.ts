/**
 * @file Validation for user-supplied extraction target URLs (SSRF protection).
 */

const PRIVATE_HOST_PATTERN =
  /^(localhost|.*\.local|127\.|10\.|192\.168\.|169\.254\.|0\.0\.0\.0|\[::1\]|\[fc00|\[fd00|\[fe80)/;

/**
 * Checks that a URL is a public http(s) address safe for extraction.
 * @param {string} raw - The URL to validate.
 * @returns {boolean} True when the URL is allowed.
 */
export function isAllowedExtractionUrl(raw: string): boolean {
  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    return false;
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return false;
  const host = parsed.hostname.toLowerCase();
  if (!host) return false;
  // WHATWG URL keeps brackets on IPv6 literals (e.g. "[::1]").
  if (PRIVATE_HOST_PATTERN.test(host)) return false;
  // 172.16.0.0/12 private range
  const m172 = host.match(/^172\.(\d+)\./);
  if (m172) {
    const second = Number(m172[1]);
    if (second >= 16 && second <= 31) return false;
  }
  return true;
}
