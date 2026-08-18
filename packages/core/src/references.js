import fs from "fs/promises";
import path from "path";

/**
 * Save reference to catalog
 * @param {string} name - Reference name
 * @param {Object} data - Reference data
 * @returns {Promise<string>} Saved reference path
 */
export async function saveReference(name, data) {
  const dir = path.join(process.cwd(), "references");
  await fs.mkdir(dir, { recursive: true });

  const filePath = path.join(dir, `${name}.json`);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));

  return filePath;
}

/**
 * Load reference from catalog
 * @param {string} name - Reference name
 * @returns {Promise<Object|null>} Reference data or null
 */
export async function loadReference(name) {
  const filePath = path.join(process.cwd(), "references", `${name}.json`);

  try {
    const content = await fs.readFile(filePath, "utf-8");
    return JSON.parse(content);
  } catch {
    return null;
  }
}

/**
 * List all saved references
 * @returns {Promise<string[]>} Reference names
 */
export async function listReferences() {
  const dir = path.join(process.cwd(), "references");

  try {
    const files = await fs.readdir(dir);
    return files.filter((f) => f.endsWith(".json")).map((f) => f.replace(".json", ""));
  } catch {
    return [];
  }
}
