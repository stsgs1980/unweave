import { describe, it, expect } from "vitest";
import { isAllowedExtractionUrl } from "../lib/validate-url";

describe("Web: validate-url", () => {
  it("allows public http(s) URLs", () => {
    expect(isAllowedExtractionUrl("https://linear.app")).toBe(true);
    expect(isAllowedExtractionUrl("http://example.com/page?x=1")).toBe(true);
    expect(isAllowedExtractionUrl("https://www.stripe.com")).toBe(true);
  });

  it("rejects non-http schemes", () => {
    expect(isAllowedExtractionUrl("file:///C:/Windows/system.ini")).toBe(false);
    expect(isAllowedExtractionUrl("ftp://example.com")).toBe(false);
    expect(isAllowedExtractionUrl("javascript:alert(1)")).toBe(false);
    expect(isAllowedExtractionUrl("data:text/html,hi")).toBe(false);
  });

  it("rejects loopback and private network hosts", () => {
    expect(isAllowedExtractionUrl("http://localhost:3000/api/extract")).toBe(false);
    expect(isAllowedExtractionUrl("http://127.0.0.1/")).toBe(false);
    expect(isAllowedExtractionUrl("http://[::1]/")).toBe(false);
    expect(isAllowedExtractionUrl("http://10.0.0.5/")).toBe(false);
    expect(isAllowedExtractionUrl("http://192.168.1.1/router")).toBe(false);
    expect(isAllowedExtractionUrl("http://169.254.169.254/latest/meta-data")).toBe(false);
    expect(isAllowedExtractionUrl("http://172.16.0.1/")).toBe(false);
  });

  it("rejects malformed URLs", () => {
    expect(isAllowedExtractionUrl("not-a-url")).toBe(false);
    expect(isAllowedExtractionUrl("")).toBe(false);
  });
});
