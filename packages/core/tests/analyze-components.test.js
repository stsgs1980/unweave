import { describe, it, expect } from "vitest";
import { classifyComponents, deriveComponentName } from "../src/analyze/analyze-components.js";

const el = (overrides) => ({
  tagName: "button",
  className: "",
  id: "",
  computedStyles: {},
  ...overrides,
});

describe("deriveComponentName", () => {
  it("uses the semantic suffix of a CSS-module class", () => {
    expect(deriveComponentName("button", "CV-gUa_buttonBase")).toBe("ButtonBase");
  });

  it("converts kebab-case to PascalCase", () => {
    expect(deriveComponentName("a", "hide-tablet")).toBe("HideTablet");
  });

  it("falls back to the capitalized tag when no class", () => {
    expect(deriveComponentName("nav", "")).toBe("Nav");
  });
});

describe("classifyComponents grouping", () => {
  it("merges instances sharing tag and primary class", () => {
    const components = classifyComponents([
      el({ tagName: "BUTTON", className: "CV-gUa_buttonBase CV-gUa_primary" }),
      el({ tagName: "BUTTON", className: "CV-gUa_buttonBase active" }),
      el({ tagName: "A", className: "CV-gUa_buttonBase" }),
    ]);
    const buttons = components.filter((c) => c.tagName === "BUTTON");
    expect(buttons).toHaveLength(1);
    expect(buttons[0].instances).toBe(2);
    expect(buttons[0].name).toBe("ButtonBase");
  });

  it("counts real variants as distinct style signatures", () => {
    const components = classifyComponents([
      el({ tagName: "BUTTON", className: "x_btn", computedStyles: { color: "rgb(0, 0, 0)" } }),
      el({ tagName: "BUTTON", className: "x_btn", computedStyles: { color: "rgb(0, 0, 0)" } }),
      el({
        tagName: "BUTTON",
        className: "x_btn danger",
        computedStyles: { color: "rgb(220, 38, 38)" },
      }),
    ]);
    const btn = components.find((c) => c.name === "Btn");
    expect(btn.variants).toHaveLength(2);
    expect(btn.variants[0].count).toBe(2);
    expect(btn.variants[1].count).toBe(1);
  });

  it("keeps same tag with different primary classes separate", () => {
    const components = classifyComponents([
      el({ tagName: "UL", className: "TZTsQG_list" }),
      el({ tagName: "UL", className: "MR81zG_root" }),
    ]);
    expect(components.filter((c) => c.tagName === "UL")).toHaveLength(2);
  });
});
