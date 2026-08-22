"use client";

/**
 * @file Code formatting utilities for HTML/CSS display
 */

/**
 * Simple HTML/CSS formatter for fallback code display
 * @param {string} code - Raw HTML/CSS code
 * @param {"html" | "css"} type - Type of code
 * @returns Formatted code string
 */
export function formatCode(code: string, type: "html" | "css"): string {
  if (!code) return "";
  if (type === "css") {
    return code
      .replace(/\s*{\s*/g, " {\n  ")
      .replace(/\s*;\s*/g, ";\n  ")
      .replace(/\s*}\s*/g, "\n}\n")
      .replace(/;\s*$/, ";")
      .split("\n")
      .map((line) => (line.trim() ? "  " + line.trim() : ""))
      .join("\n")
      .trim();
  }
  // HTML formatting
  return code
    .replace(/></g, ">\n<")
    .replace(/^<\?xml/, "")
    .trim()
    .split("\n")
    .map((line) => {
      const indent = line.match(/^<\//) ? -1 : line.match(/^<[^/]/) ? 0 : 0;
      return "  ".repeat(Math.max(0, indent)) + line.trim();
    })
    .join("\n");
}
