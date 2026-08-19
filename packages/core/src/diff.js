/**
 * Сравнивает два массива и находит уникальные и общие элементы
 * @template T
 * @param {T[]} arr1 - Первый массив
 * @param {T[]} arr2 - Второй массив
 * @returns {Object} Результат сравнения (onlyInFirst, onlyInSecond, common)
 */
export function diffArrays(arr1, arr2) {
  const set1 = new Set(arr1);
  const set2 = new Set(arr2);

  return {
    onlyInFirst: [...set1].filter((x) => !set2.has(x)),
    onlyInSecond: [...set2].filter((x) => !set1.has(x)),
    common: [...set1].filter((x) => set2.has(x)),
  };
}

/**
 * Сравнивает две дизайн-системы и возвращает различия
 * @param {Object} ds1 - Первая дизайн-система
 * @param {Object} ds2 - Вторая дизайн-система
 * @returns {Object} Объект с различиями по категориям (colors, spacing, radius, typography)
 */
export function diffDesignSystems(ds1, ds2) {
  if (!ds1 || !ds2) return { error: "Missing design system data" };

  return {
    colors: diffArrays(ds1.colors?.all || [], ds2.colors?.all || []),
    spacing: diffArrays(ds1.spacing?.all || [], ds2.spacing?.all || []),
    radius: diffArrays(ds1.radius?.all || [], ds2.radius?.all || []),
    typography: {
      fonts: diffArrays(ds1.typography?.fonts || [], ds2.typography?.fonts || []),
      sizes: diffArrays(ds1.typography?.fontSizes || [], ds2.typography?.fontSizes || []),
    },
  };
}

/**
 * Сравнивает два набора компонентов и находит различия по типам
 * @param {Array<Object>} comp1 - Массив компонентов первого сайта
 * @param {Array<Object>} comp2 - Массив компонентов второго сайта
 * @returns {Object} Результат сравнения (onlyInFirst, onlyInSecond, common)
 */
export function diffComponents(comp1, comp2) {
  const types1 = new Set((comp1 || []).map((c) => c.type));
  const types2 = new Set((comp2 || []).map((c) => c.type));

  return {
    onlyInFirst: [...types1].filter((t) => !types2.has(t)),
    onlyInSecond: [...types2].filter((t) => !types1.has(t)),
    common: [...types1].filter((t) => types2.has(t)),
  };
}

/**
 * Сравнивает паттерны компонентов между двумя сайтами
 * @param {Object} p1 - Паттерны первого сайта (ключ - тип паттерна, значение - количество)
 * @param {Object} p2 - Паттерны второго сайта (та же структура)
 * @returns {Object} Различия в паттернах (объект с ключами паттернов и значениями first, second, diff)
 */
export function diffPatterns(p1, p2) {
  const keys = new Set([...Object.keys(p1 || {}), ...Object.keys(p2 || {})]);
  const diff = {};

  for (const key of keys) {
    const v1 = p1?.[key] || 0;
    const v2 = p2?.[key] || 0;
    if (v1 !== v2) {
      diff[key] = { first: v1, second: v2, diff: v2 - v1 };
    }
  }

  return diff;
}
