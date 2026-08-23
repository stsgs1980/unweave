import { describe, it, expect, afterEach } from "vitest";
import { extractElements } from "../src/extract-elements.js";

/**
 *
 * @param tagName
 * @param options
 */
function fakeEl(tagName, options = {}) {
  const {
    attrs = {},
    styles = {},
    rect = { x: 0, y: 0, width: 10, height: 10 },
    textContent = "",
  } = options;
  return {
    tagName: tagName.toUpperCase(),
    id: attrs.id || "",
    className: attrs.class || "",
    attributes: Object.entries(attrs).map(([name, value]) => ({ name, value })),
    textContent,
    getBoundingClientRect: () => rect,
    __styles: styles,
  };
}

/**
 *
 * @param elements
 */
function createFakePage(elements) {
  globalThis.document = { querySelectorAll: () => elements };
  globalThis.window = {
    getComputedStyle: (el) => ({
      getPropertyValue: (prop) => el.__styles[prop] ?? "",
    }),
  };
  return {
    async evaluate(fn, arg) {
      const deserialized = new Function(`return (${fn.toString()});`)();
      return deserialized(arg);
    },
  };
}

describe("Core: extractElements", () => {
  afterEach(() => {
    delete globalThis.document;
    delete globalThis.window;
  });

  it("works when evaluate callback is serialized (no Node scope references)", async () => {
    const page = createFakePage([
      fakeEl("script"),
      fakeEl("div", { styles: { display: "none" } }),
      fakeEl("span", {
        attrs: { class: "label" },
        styles: { color: "rgb(0, 0, 0)", "font-size": "16px", margin: "0px" },
        textContent: "Hello",
      }),
    ]);

    const result = await extractElements(page);

    expect(result).toHaveLength(1);
    expect(result[0].tagName).toBe("span");
    expect(result[0].className).toBe("label");
    expect(result[0].textContent).toBe("Hello");
    expect(result[0].computedStyles.color).toBe("rgb(0, 0, 0)");
    expect(result[0].computedStyles["font-size"]).toBe("16px");
    expect(result[0].computedStyles.margin).toBeUndefined();
    expect(result[0].boundingRect).toEqual({ x: 0, y: 0, width: 10, height: 10 });
  });

  it("filters invisible elements by computed styles", async () => {
    const page = createFakePage([
      fakeEl("div", { styles: { visibility: "hidden" } }),
      fakeEl("div", { styles: { opacity: "0" } }),
      fakeEl("div", { rect: { x: 0, y: 0, width: 0, height: 0 } }),
      fakeEl("button", { styles: { color: "red" } }),
    ]);

    const result = await extractElements(page);

    expect(result).toHaveLength(1);
    expect(result[0].tagName).toBe("button");
  });

  it("respects maxElements limit", async () => {
    const page = createFakePage([fakeEl("div"), fakeEl("p"), fakeEl("span")]);

    const result = await extractElements(page, 2);

    expect(result).toHaveLength(2);
  });
});
