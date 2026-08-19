import jsdoc from "eslint-plugin-jsdoc";
import markdown from "@eslint/markdown";
import tsParser from "@typescript-eslint/parser";
import unicodePolicy from "./eslint-rules/unicode-policy.js";
import codeBlockLanguage from "./eslint-rules/code-block-language.js";

const codeBlockLanguagePlugin = {
  meta: { name: "code-block-language", version: "1.0.0" },
  rules: { "require-language": codeBlockLanguage },
};

export default [
  {
    ignores: [
      "node_modules/**",
      "dist/**",
      "build/**",
      "coverage/**",
      "test-results/**",
      "references/**",
      "**/.next/**",
      "**/.turbo/**",
      "**/out/**",
      "**/.idea/**",
      "*.log",
      "*.tsbuildinfo",
    ],
  },
  ...markdown.configs.recommended,
  {
    files: ["**/*.md"],
    rules: {
      // Отключаем правила, которые ругаются на наши теги [OK], [FAIL], [TODO]
      "markdown/no-missing-label-refs": "off",
      // Отключаем требование языка для code blocks (не все блоки кода в docs имеют язык)
      "markdown/fenced-code-language": "off",
    },
  },
  {
    files: ["**/*.md"],
    plugins: {
      "unicode-policy": unicodePolicy,
      "code-block-language": codeBlockLanguagePlugin,
    },
    rules: {
      "unicode-policy/emoji-in-md": "error",
      "unicode-policy/unicode-graphics-in-md": "error",
      "code-block-language/require-language": "error",
    },
  },
  {
    files: ["**/*.{ts,tsx,js,jsx,mjs,cjs}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: { jsx: true },
      },
      globals: {
        console: "readonly",
        process: "readonly",
        URL: "readonly",
        document: "readonly",
        window: "readonly",
        getComputedStyle: "readonly",
        location: "readonly",
        require: "readonly",
        module: "readonly",
        __dirname: "readonly",
        fetch: "readonly",
        Headers: "readonly",
        Request: "readonly",
        Response: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        Promise: "readonly",
        Map: "readonly",
        Set: "readonly",
        Array: "readonly",
        Object: "readonly",
        JSON: "readonly",
        Error: "readonly",
        RegExp: "readonly",
        Date: "readonly",
        Math: "readonly",
      },
    },
    plugins: {
      jsdoc,
      "unicode-policy": unicodePolicy,
    },
    rules: {
      "unicode-policy/emoji": "error",
      "unicode-policy/unicode-graphics": "error",
      "no-irregular-whitespace": "error",
      "jsdoc/require-jsdoc": "warn",
      "jsdoc/require-param": "warn",
      "jsdoc/require-returns": "warn",
    },
  },
];
