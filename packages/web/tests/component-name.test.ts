import { describe, it, expect } from "vitest";
import { deriveComponentName } from "../lib/component-name";

describe("Web: component-name", () => {
  it("derives a PascalCase name from the URL host", () => {
    expect(deriveComponentName("https://linear.app")).toBe("Linear");
    expect(deriveComponentName("https://example.com")).toBe("Example");
    expect(deriveComponentName("https://docs.google.com")).toBe("Docs");
  });

  it("ignores the www prefix", () => {
    expect(deriveComponentName("https://www.stripe.com/pricing")).toBe("Stripe");
  });

  it("falls back when the URL has no usable host", () => {
    expect(deriveComponentName("not-a-url")).toBe("ExtractedPage");
    expect(deriveComponentName("")).toBe("ExtractedPage");
  });
});
