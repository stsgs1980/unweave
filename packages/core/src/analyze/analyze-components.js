/**
 * Normalize className to string (handles SVGAnimatedString)
 * @param {string|Object} className - Raw className from element
 * @returns {string} Normalized string
 */
function normalizeClassName(className) {
  if (!className) return '';
  if (typeof className === 'string') return className;
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
  if (el.className) selector += `.${normalizeClassName(el.className).split(' ').join('.')}`;
  return selector;
}

/**
 * Infer component type from element
 * @param {Object} el - Element
 * @returns {string} Component type
 */
export function inferComponentType(el) {
  const { tagName, className = '', attributes = {} } = el;
  const cls = normalizeClassName(className).toLowerCase();
  const role = attributes.role || '';

  // Button
  if (tagName === 'button' || role === 'button' || cls.includes('btn') || cls.includes('button')) {
    return 'button';
  }

  // Input
  if (tagName === 'input' || tagName === 'textarea' || tagName === 'select' || role === 'textbox') {
    return 'input';
  }

  // Card
  if (cls.includes('card') || cls.includes('tile')) {
    return 'card';
  }

  // Navigation
  if (tagName === 'nav' || cls.includes('nav') || cls.includes('menu') || role === 'navigation') {
    return 'navigation';
  }

  // Modal/Dialog
  if (
    role === 'dialog' ||
    role === 'alertdialog' ||
    cls.includes('modal') ||
    cls.includes('dialog')
  ) {
    return 'modal';
  }

  // Table
  if (tagName === 'table' || role === 'grid') {
    return 'table';
  }

  // List
  if (tagName === 'ul' || tagName === 'ol' || role === 'list' || cls.includes('list')) {
    return 'list';
  }

  // Heading
  if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tagName)) {
    return 'heading';
  }

  // Image
  if (tagName === 'img' || role === 'img') {
    return 'image';
  }

  // Link
  if (tagName === 'a' || role === 'link') {
    return 'link';
  }

  // Form
  if (tagName === 'form') {
    return 'form';
  }

  return 'unknown';
}

/**
 * Classify components from elements
 * @param {Array} elements - Extracted elements
 * @returns {Array} Classified components
 */
export function classifyComponents(elements) {
  const components = [];
  const seen = new Set();

  for (const el of elements) {
    const cls = normalizeClassName(el.className);
    const key = `${el.tagName}.${cls}.${el.id || ''}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const type = inferComponentType(el);
    if (type !== 'unknown') {
      components.push({
        selector: buildSelector(el),
        type,
        tagName: el.tagName,
        className: cls,
        id: el.id,
        styles: el.computedStyles,
      });
    }
  }

  return components;
}
