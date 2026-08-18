# Unweave — Анализ проекта и дорожная карта

> Дата анализа: 2026-08-18
> Репозиторий: https://github.com/stsgs1980/unweave
> Статус: активная разработка, шаг 2 (web-пакет)

---

## 1. Происхождение проекта

Проект родился из анализа двух существующих репозиториев:

| Репозиторий                           | Стек                                                            | Сильные стороны                                                                          | Слабые стороны                                                    |
| ------------------------------------- | --------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| `UI-Design-Extractor-App-Development` | Next.js 16, React 19, Prisma, shadcn/ui, z-ai-web-dev-sdk (LLM) | Готовый UI, БД, Zustand, проработанный UX                                                | LLM-зависимость, rate-limit, монолит 487 строк, нет транзакций БД |
| `ui-extractor`                        | pnpm-монорепо: core/cli/mcp, Playwright, JS                     | Детерминированный анализ, Playwright, MCP, Anti-Monolith (<250 строк), строгие стандарты | Нет UI, нет БД, только CLI/MCP                                    |

**Решение**: объединить — взять **функционал** из `ui-extractor` (core/cli/mcp) и **UI** из `UI-Design-Extractor-App-Development`, переработав его по современным референсам (Dribbble, Untitled UI).

---

## 2. Хронология обсуждения

| #   | Этап                            | Результат                                                                                                              |
| --- | ------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| 1   | Аудит двух репозиториев         | `ui-extractor` оценён 9/10, `UI-Design-Extractor` — 6/10                                                               |
| 2   | Функциональное сравнение        | Определены 19 категорий сравнения, `ui-extractor` выигрывает в 12/19                                                   |
| 3   | Стратегия миграции              | Выбрана архитектура монорепо с 4 пакетами                                                                              |
| 4   | Выбор UI-основы                 | Изначально предложен shadcn/ui, затем исправлено на **Untitled UI FREE**                                               |
| 5   | Фикс финального стека           | Зафиксирован стек из 10+ библиотек                                                                                     |
| 6   | HTML-редизайн                   | Собран полноценный wireframe на 7 экранов                                                                              |
| 7   | Создание `unweave`              | Репозиторий создан на базе шаблона `webstorm-config`                                                                   |
| 8   | Настройка монорепо              | 4 пакета: core, cli, mcp, web                                                                                          |
| 9   | Smoke-test CLI                  | Pipeline отработал: Extract → Analyze → Spec → Generate                                                                |
| 10  | Фикс багов в core               | 4 бага закрыты (SVG className, data-testid, JSDoc, CLI path)                                                           |
| 11  | Коммиты и push                  | 3 коммита по Conventional Commits, push успешен                                                                        |
| 12  | Установка зависимостей web      | Добавлены: @tanstack/react-query, zustand, next-themes, cmdk, tailwindcss, postcss, autoprefixer, @tailwindcss/postcss |
| 13  | Миграция eslint-plugin-markdown | Завершена: eslint-plugin-markdown → @eslint/markdown@8.0.3                                                             |

---

## 3. Финальный технологический стек

### 3.1. UI-слой (packages/web)

| Слой             | Библиотека                    | Назначение                                                              | Статус              |
| ---------------- | ----------------------------- | ----------------------------------------------------------------------- | ------------------- |
| База компонентов | **Untitled UI FREE**          | Кнопки, инпуты, селекты, модалки, бейджи, аватары, тултипы + React Aria | [TODO] установить   |
| Wow-эффекты      | **Magic UI**                  | Bento-grid, marquee, анимированные карточки для дашборда                | [TODO] установить   |
| Дашборд-метрики  | **Tremor Raw**                | Спарклайны, bar/line чарты, KPI-карточки                                | [TODO] установить   |
| Command Palette  | **cmdk**                      | ⌘K палитра (уже установлен)                                             | [OK]                |
| Анимации         | **Motion** (ex-Framer Motion) | Переходы шагов wizard, анимации списков                                 | [TODO] установить   |
| State (client)   | **Zustand**                   | Клиентское состояние (уже установлен)                                   | [OK]                |
| State (server)   | **TanStack Query v5**         | API pipeline, кеширование (уже установлен)                              | [OK]                |
| URL-state        | **Nuqs**                      | Типизированные search params                                            | [TODO] установить   |
| Формы            | **React Hook Form + Zod**     | Валидация форм извлечения                                               | [TODO] установить   |
| Тосты            | **Sonner**                    | Уведомления                                                             | [TODO] установить   |
| Иконки           | **Lucide-react**              | Иконки интерфейса                                                       | [TODO] установить   |
| Утилиты          | **clsx + tailwind-merge**     | `cn()` для классов                                                      | [TODO] установить   |
| Таблицы          | **TanStack Table**            | Таблица компонентов                                                     | [TODO] установить   |
| Headless         | **Radix UI**                  | Модалки, диалоги (через Untitled UI)                                    | [OK] через Untitled |

### 3.2. Core-слой (packages/core, cli, mcp)

| Пакет           | Зависимости               | Назначение                    |
| --------------- | ------------------------- | ----------------------------- |
| `@unweave/core` | playwright                | Извлечение, анализ, генерация |
| `@unweave/cli`  | commander, chalk, ora     | CLI-интерфейс                 |
| `@unweave/mcp`  | @modelcontextprotocol/sdk | MCP-сервер для AI-агентов     |

### 3.3. Инструменты разработки

| Инструмент          | Версия | Назначение                                        |
| ------------------- | ------ | ------------------------------------------------- |
| Next.js             | 16     | Web-фреймворк                                     |
| React               | 19     | UI-библиотека                                     |
| TypeScript          | 5.9    | Типизация                                         |
| Tailwind CSS        | 4.3    | Утилитарные стили (уже установлен)                |
| ESLint              | 10     | Линтинг (миграция на @eslint/markdown в процессе) |
| Prettier            | 3.9    | Форматирование                                    |
| Husky + lint-staged | 9 / 17 | Pre-commit хуки                                   |
| commitlint          | 21     | Conventional Commits                              |
| Vitest              | 2      | Тесты                                             |
| pnpm                | 11.22  | Пакетный менеджер                                 |

---

## 4. Архитектура монорепо

```
unweave/
├── packages/
│   ├── core/          # Ядро: extract, analyze, spec, generate, pipeline, references, compare
│   │   └── src/
│   │       ├── analyze/      # analyze-colors, spacing, radius, typography, components, patterns
│   │       ├── spec/         # spec-props, states, variants, accessibility, responsive, design-tokens, examples
│   │       ├── extract.js
│   │       ├── analyze.js
│   │       ├── spec.js
│   │       ├── generate.js
│   │       ├── generate-react.js
│   │       ├── generate-vue.js
│   │       ├── generate-html.js
│   │       ├── generate-css.js
│   │       ├── generate-storybook.js
│   │       ├── pipeline.js
│   │       ├── references.js
│   │       ├── compare.js
│   │       └── index.js
│   ├── cli/           # CLI-обёртка над core
│   │   └── src/
│   │       ├── commands/     # pipeline, extract, analyze, spec, generate, learn, references, ...
│   │       └── index.js
│   ├── mcp/           # MCP-сервер для AI-агентов
│   │   └── src/
│   │       ├── tools/        # uix-pipeline, uix-extract, uix-analyze, ...
│   │       └── server.js
│   └── web/           # Next.js-студия (UI + API-роуты над core)
│       └── app/              # App Router
├── eslint-rules/      # Кастомные правила: unicode-policy, code-block-language
├── eslint-processors/ # markdown-snippets
├── docs/              # Документация
├── .aiassistant/      # AI Rules
├── pnpm-workspace.yaml
├── package.json
├── tsconfig.base.json
├── eslint.config.js
├── commitlint.config.js
└── README.md
```

**Правило импортов**: web → core, cli → core, mcp → core. Core не импортирует другие пакеты.

---

## 5. UI/UX — что строим (по HTML-wireframe)

### 5.1. Визуальный язык

| Параметр     | Значение                                                           |
| ------------ | ------------------------------------------------------------------ |
| Тема         | Тёмная по умолчанию, есть светлая                                  |
| Основной фон | `#0b0b10`                                                          |
| Фон карточек | `#15151d`                                                          |
| Акцент       | Градиент indigo→violet→fuchsia (`#6366f1` → `#8b5cf6` → `#d946ef`) |
| Текст        | `#eceaf4`                                                          |
| Muted        | `#8f8da3`                                                          |
| Шрифт        | Inter (UI), JetBrains Mono (код)                                   |
| Радиусы      | 14px (карточки), 10px (элементы)                                   |

### 5.2. Экраны

#### Dashboard

- **Hero-блок** с градиентной рамкой: input URL + кнопка "Извлечь" + чипы опций (скриншоты, дизайн-система, компоненты, storybook)
- **4 статистики** со спарклайнами: Проекты, Компоненты, Токены, Референсы
- **Recent Projects**: grid 2x2 с карточками (превью-градиент, название, URL, бейджи)
- **Pipeline Stepper**: live-индикатор текущего пайплайна с логами в реальном времени

#### Extract Wizard (4 шага)

1. **Source**: URL, viewport (desktop/tablet/mobile карточки), фокус на компонентах
2. **Options**: чипы скриншотов, форматы кода (React/Vue/HTML), доп. опции (TS, Tailwind, Storybook, тесты)
3. **Preview**: live-iframe сайта с click-to-select компонентов
4. **Summary**: таблица параметров перед запуском

#### Workspace (split-view)

- **Слева**: список компонентов с поиском (Button, Card, Navigation, Input, Modal)
- **Справа**: табы Code/Preview/Split
  - Preview: live-рендер компонента с переключением variants (Primary/Secondary/Ghost) и states (Default/Hover/Focus/Disabled)
  - Props table: имя, тип, default
  - Accessibility checklist
  - Code: подсветка синтаксиса

#### Tokens

- **Цвета**: 8 swatches с копированием по клику
- **Отступы**: 6 баров с визуализацией размера
- **Типографика**: 4 строки с превью шрифтов

#### References

- Grid 4 колонки: карточки с превью-градиентом, тегами, рейтингом (звёзды), кнопкой "Использовать"
- Фильтры: чипы (Все, Избранные, design-system, saas, e-commerce)

#### Command Palette (⌘K)

- Поиск действий и проектов
- Группы: Действия, Проекты, Инструменты
- Хоткеи: ⌘N (extract), ⌘E (export), Esc (закрыть)

#### Export Modal

- Форматы: ZIP / Figma / Storybook / npm
- Выбор компонентов (чипы)
- Опции: TypeScript, Tailwind, Тесты, Документация

---

## 6. Текущий статус (на 2026-08-18)

### Что сделано [OK]

- Монорепо с 4 пакетами настроено и работает
- CLI запускается из корня (`pnpm cli`)
- Pipeline проходит все 4 этапа на живом сайте (ui.shadcn.com)
- Исправлены 4 бага в core:
  - `SVGAnimatedString` в `analyze-components.js` (нормализация через `String()`)
  - `data-testid` в `generate-react.js` (camelCase конвертация)
  - Пустые JSDoc в `pipeline.js`
  - CLI output path (через `node packages/cli/src/index.js` вместо `pnpm --filter`)
- 3 коммита по Conventional Commits запушены в origin/main
- Базовые зависимости web установлены: @tanstack/react-query, zustand, next-themes, cmdk, tailwindcss, postcss, autoprefixer, @tailwindcss/postcss

### В процессе [IN PROGRESS]

- (пусто — миграция eslint завершена)

### Не начато [TODO]

- Установка UI-библиотек: Untitled UI FREE, Magic UI, Tremor Raw, Motion, Sonner, Lucide, Nuqs, React Hook Form + Zod
- Настройка темы и провайдеров (ThemeProvider, RouteProvider)
- Создание глобальных стилей (`globals.css` с токенами)
- Реализация Dashboard по wireframe
- Реализация Extract Wizard
- Реализация Workspace со split-view
- Реализация Tokens и References
- Реализация Command Palette
- Реализация Export Modal
- API-роуты web → core (extract, analyze, spec, generate)
- Интеграция с Prisma (опционально)
- Тесты (Vitest)
- CI/CD (GitHub Actions)

---

## 7. История коммитов (актуальная)

```
b0ef88a fix(cli): resolve output dir from user cwd, improve pipeline logs
5a743d7 fix(core): normalize SVG className and fix React generator
ed38c43 chore: remove package-lock.json and ignore test outputs
5660248 refactor(core): split pipeline into separate modules
cff333d Initial commit
```

---

## 8. Следующие шаги (приоритет)

1. **[СЕЙЧАС]** Установить UI-библиотеки: Untitled UI FREE, Magic UI, Tremor Raw, Motion, Sonner, Lucide
2. Настроить тему: `globals.css` с токенами из wireframe, ThemeProvider
3. Реализовать каркас: sidebar + topbar + ⌘K
4. Реализовать Dashboard (hero + stats + project cards)
5. Реализовать Extract Wizard (4 шага)
6. Реализовать Workspace (split-view + live preview)
7. Подключить API-роуты к core-функциям
8. Полировка: анимации, тосты, responsive

---

## 9. Паспорт проекта (для восстановления контекста)

```
ПРОЕКТ: Unweave (объединение UI-Design-Extractor + ui-extractor)
ИСТОЧНИКИ:
- UI: github.com/stsgs1980/UI-Design-Extractor-App-Development
  (Next.js 16, React 19, TS, Tailwind 4, shadcn, Prisma+SQLite, Zustand)
- Core: github.com/stsgs1980/ui-extractor
  (pnpm-монорепо: core/cli/mcp, Playwright, JS, MCP server)
  РЕПОЗИТОРИЙ: github.com/stsgs1980/unweave
  СТЕК (ФИНАЛЬНО):
- UI-основа: Untitled UI FREE (база) + Magic UI (wow) + Tremor Raw (дашборд)
- ⌘K: cmdk
- Анимации: Motion
- State: Zustand + TanStack Query v5
- Формы: React Hook Form + Zod
- Тосты: Sonner
- Иконки: Lucide-react
- Core: Playwright, commander, chalk, ora
- MCP: @modelcontextprotocol/sdk
- Web: Next.js 16, React 19, TypeScript, Tailwind CSS 4
- Стандарты: Conventional Commits, AI Rules, Anti-Monolith (<250 строк)
  UI-РЕШЕНИЯ (по HTML-wireframe):
- Тёмная тема с градиентом indigo→violet→fuchsia
- 7 экранов: Dashboard, Extract Wizard (4 шага), Workspace, Tokens, References, ⌘K, Export
- Split-view в Workspace с live preview компонентов
- Спарклайны в статистике, click-to-select в preview
  СТАТУС: шаг 3 — миграция eslint завершена, следующая установка UI-библиотек
```
