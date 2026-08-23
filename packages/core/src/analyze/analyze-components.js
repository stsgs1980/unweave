/**
 * Normalize className to string (handles SVGAnimatedString)
 * @param {string|Object} className - Raw className from element
 * @returns {string} Normalized string
 */
function normalizeClassName(className) {
  if (!className) return "";
  if (typeof className === "string") return className;
  return className.baseVal || String(className);
}

/**
 * Build CSS selector from element
 * @param {Object} el - Element
 * @returns {string} CSS selector
 */
export function buildSelector(el) {
  let selector = el.tagName.toLowerCase();
  if (el.id) selector += `#${el.id}`;
  if (el.className) selector += `.${normalizeClassName(el.className).split(" ").join(".")}`;
  return selector;
}

/**
 * Infer component type from element
 * @param {Object} el - Element
 * @returns {string} Component type
 */
export function inferComponentType(el) {
  const { className = "", attributes = {} } = el;
  const tagName = (el.tagName || "").toLowerCase();
  const cls = normalizeClassName(className).toLowerCase();
  const role = attributes.role || "";

  // Button
  if (tagName === "button" || role === "button" || cls.includes("btn") || cls.includes("button")) {
    return "button";
  }

  // Input
  if (tagName === "input" || tagName === "textarea" || tagName === "select" || role === "textbox") {
    return "input";
  }

  // Card
  if (cls.includes("card") || cls.includes("tile")) {
    return "card";
  }

  // Navigation
  if (tagName === "nav" || cls.includes("nav") || cls.includes("menu") || role === "navigation") {
    return "navigation";
  }

  // Modal/Dialog
  if (
    role === "dialog" ||
    role === "alertdialog" ||
    cls.includes("modal") ||
    cls.includes("dialog")
  ) {
    return "modal";
  }

  // Table
  if (tagName === "table" || role === "grid") {
    return "table";
  }

  // List
  if (tagName === "ul" || tagName === "ol" || role === "list" || cls.includes("list")) {
    return "list";
  }

  // Heading
  if (["h1", "h2", "h3", "h4", "h5", "h6"].includes(tagName)) {
    return "heading";
  }

  // Image
  if (tagName === "img" || role === "img") {
    return "image";
  }

  // Link
  if (tagName === "a" || role === "link") {
    return "link";
  }

  // Form
  if (tagName === "form") {
    return "form";
  }

  return "unknown";
}

/**
 * Derive a human-friendly component name from a tag and its primary class.
 * Prefers the semantic suffix of CSS-module classes (e.g. "TZTsQG_menuRoot"
 * -> "MenuRoot"), then kebab/snake tokens, and falls back to the tag itself.
 * @param {string} tagName - Element tag name
 * @param {string} className - Raw class string
 * @returns {string} PascalCase component name
 */
export function deriveComponentName(tagName, className) {
  const cls = normalizeClassName(className).trim();
  const primary = cls ? cls.split(/\s+/)[0] : "";
  const suffix = primary.includes("_") ? primary.split("_").pop() : primary;
  const cleaned = suffix.replace(/[^a-zA-Z0-9-]+/g, "");
  const source = cleaned || tagName || "Component";
  return source
    .split(/[-_]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

/**
 * Stable signature of computed styles used to distinguish visual variants.
 * @param {Object} styles - Computed styles map
 * @returns {string} Serialized signature
 */
function styleSignature(styles) {
  const keys = Object.keys(styles || {}).sort();
  return keys.map((k) => `${k}:${styles[k]}`).join(";");
}

/**
 * Classify components from elements
 * Groups instances by semantic identity (tag + primary class) and records
 * real visual variants as distinct computed-style signatures.
 * @param {Array} elements - Extracted elements
 * @returns {Array} Classified components
 */
export function classifyComponents(elements) {
  const groups = new Map();

  for (const el of elements) {
    const type = inferComponentType(el);
    if (type === "unknown") continue;

    const cls = normalizeClassName(el.className).trim();
    const primaryClass = cls ? cls.split(/\s+/)[0] : "";
    const key = `${el.tagName.toLowerCase()}|${primaryClass}`;

    if (!groups.has(key)) {
      groups.set(key, {
        selector: buildSelector(el),
        type,
        tagName: el.tagName,
        className: primaryClass,
        id: el.id || null,
        name: deriveComponentName(el.tagName, primaryClass),
        styles: el.computedStyles,
        instances: 0,
        variantMap: new Map(),
      });
    }

    const group = groups.get(key);
    group.instances += 1;
    if (!group.id && el.id) {
      group.id = el.id;
      group.selector = buildSelector(el);
    }
    const signature = styleSignature(el.computedStyles);
    const variant = group.variantMap.get(signature);
    if (variant) variant.count += 1;
    else group.variantMap.set(signature, { styles: el.computedStyles || {}, count: 1 });
  }

  return Array.from(groups.values()).map((group) => ({
    selector: group.selector,
    type: group.type,
    tagName: group.tagName,
    className: group.className,
    id: group.id,
    name: group.name,
    styles: group.styles,
    instances: group.instances,
    variants: Array.from(group.variantMap.values()),
  }));
}
