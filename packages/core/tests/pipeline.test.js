import { describe, it, expect } from "vitest";
// Так как inferComponentType не экспортируется, проверяем её через generateSpec или мокаем pipeline.
// Но для простоты давайте проверим, что pipeline экспортирует нужные функции.
import { pipeline, saveReference, loadReference, listReferences } from "../src/pipeline.js";
import fs from "fs/promises";
import path from "path";

describe("Core: Pipeline Utilities", () => {
  it("should save and load a reference", async () => {
    const testName = "test-ref-" + Date.now();
    const testData = { url: "https://example.com", analysis: { colors: ["#fff"] } };

    // Сохраняем
    const filePath = await saveReference(testName, testData);
    expect(filePath).toContain(testName);

    // Загружаем
    const loaded = await loadReference(testName);
    expect(loaded).toEqual(testData);

    // Проверяем, что он есть в списке
    const list = await listReferences();
    expect(list).toContain(testName);

    // Удаляем за собой
    await fs.unlink(path.join(process.cwd(), "references", `${testName}.json`));
  });
});
