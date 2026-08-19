import { describe, it, expect } from "vitest";
import { generate } from "../src/generate.js";

describe("Core: Generate React Code", () => {
  it("should generate a functional React component from spec", () => {
    const mockSpec = {
      name: "Button",
      type: "button",
      elements: [
        {
          tag: "button",
          attributes: { class: "btn-primary" },
          text: "Click me",
        },
      ],
    };

    const options = { format: "react", typescript: true };
    const result = generate(mockSpec, options);

    // Генератор возвращает объект с файлами. Извлекаем .tsx
    const code =
      typeof result === "string" ? result : result["Button.tsx"] || Object.values(result)[0];

    // Проверяем реальную структуру кода, которую генерирует ядро
    expect(code).toContain("Button"); // Имя компонента
    expect(code).toContain("<button"); // Тег button
    expect(code).toContain("forwardRef"); // Используется forwardRef
    expect(code).toContain("interface ButtonProps"); // Генерация TypeScript интерфейса
  });

  it("should handle empty spec gracefully", () => {
    const mockSpec = { name: "Empty", elements: [] };
    const options = { format: "react", typescript: true };
    const result = generate(mockSpec, options);

    const code =
      typeof result === "string" ? result : result["Empty.tsx"] || Object.values(result)[0];

    expect(code).toContain("Empty");
  });
});
