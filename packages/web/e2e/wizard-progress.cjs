/* eslint-disable */
/**
 * E2E walkthrough of the Extract Wizard progress visualization.
 * Run: node e2e/wizard-progress.cjs  (server must listen on :3000)
 * Requires: NODE_PATH pointing to packages/core/node_modules (provides playwright).
 */

const { chromium } = require("playwright");

const BASE = process.env.BASE_URL || "http://localhost:3000";
const TIMEOUT_MS = 120000;

function fail(message) {
  console.error(`[FAIL] ${message}`);
  process.exitCode = 1;
}
function pass(message) {
  console.log(`[OK] ${message}`);
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  page.setDefaultTimeout(TIMEOUT_MS);
  const seenStages = [];

  page.on("response", async (response) => {
    if (!response.url().includes("/api/status/")) return;
    try {
      const data = await response.json();
      if (Array.isArray(data.stages)) {
        seenStages.length = 0;
        seenStages.push(...data.stages.map((s) => s.stage));
      }
    } catch {
      /* status snapshots may be consumed elsewhere; ignore parse races */
    }
  });

  try {
    await page.goto(BASE, { waitUntil: "domcontentloaded" });

    await page.fill('input[placeholder="https://example.com"]', "https://linear.app");
    await page.getByRole("button", { name: /extract ui/i }).click();
    pass("wizard opened from dashboard");

    await page.getByRole("button", { name: /next: options & format/i }).click();
    await page.getByRole("button", { name: /next: element selection/i }).click();
    await page.getByRole("button", { name: /next: summary & launch/i }).click();
    await page.getByRole("button", { name: /launch extraction/i }).click();
    pass("launched extraction");

    await page.getByText("Extract components").waitFor({ timeout: 15000 });
    await page.getByText("Analyze design system").waitFor({ timeout: 5000 });
    await page.getByText("Generate specification").waitFor({ timeout: 5000 });
    await page.getByText("Generate code").waitFor({ timeout: 5000 });
    pass("stepper renders all four stages");

    await page.getByRole("button", { name: /worker log/i }).click();
    await page
      .locator("div.font-mono.text-zinc-300 >> nth=0")
      .waitFor({ state: "visible", timeout: 20000 });
    await page
      .locator("div.font-mono.text-zinc-300 :text('Worker')")
      .first()
      .waitFor({ timeout: 30000 });
    pass("log panel opens and shows job-scoped worker lines");

    await page.getByText("Extraction Complete!").waitFor({ timeout: TIMEOUT_MS });
    pass("auto-transitioned to result step after completion");

    const expected = ["extract", "analyze", "spec", "generate"];
    if (expected.every((key, i) => seenStages[i] === key) && seenStages.length === 4) {
      pass(`pipeline recorded all four stages in order: ${seenStages.join(" -> ")}`);
    } else {
      fail(`stages timeline incomplete: [${seenStages.join(", ")}]`);
    }

    const summary = await page.locator("text=/Extract \\d+ms/").count();
    if (summary > 0) pass("timing summary line was rendered");
    else console.log("[WARN] timing summary not visible on result step (transient by design)");
  } catch (error) {
    fail(error.message);
    await page.screenshot({ path: "e2e-failure.png", fullPage: true }).catch(() => {});
  } finally {
    await browser.close();
  }

  if (process.exitCode) {
    console.error("[FAIL] E2E wizard progress walkthrough failed");
  } else {
    console.log("[OK] E2E wizard progress walkthrough passed");
  }
})();
