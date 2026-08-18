# unweave

> **Status**: ACTIVE
> **Last Updated**: 2026-08-18

## Overview

Extract UI components, design tokens, and patterns from any website. Generate production-ready React, Vue, or HTML code. Ships as CLI, MCP server, and a polished web app.

Reverse-engineer any UI. Rebuild it your way.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Scripts](#scripts)
- [Architecture](#architecture)
- [Contributing](#contributing)
- [License](#license)

## Features

- Extract DOM, CSS variables, computed styles, images, screenshots
- Analyze design system: colors, spacing, radius, typography
- Generate component specs (props, states, accessibility)
- Output HTML, React, or Vue components with CSS/SCSS/Tailwind
- Full extract -> analyze -> spec -> generate pipeline in one command
- Save any site as a reference for future regeneration
- MCP Server for AI agents (Cursor, Claude, Windsurf, VS Code)

## Tech Stack

- **Core**: Playwright, TypeScript
- **CLI**: Commander, Chalk, Ora
- **MCP**: Model Context Protocol SDK
- **Web**: Next.js 16, React 19, TypeScript, Tailwind CSS 4
- **UI Libraries**: Untitled UI (FREE), Magic UI, Tremor Raw, cmdk, Motion
- **State**: Zustand, TanStack Query
- **Forms**: React Hook Form + Zod
- **Linting**: ESLint, Prettier, Husky, commitlint

## Getting Started

### Prerequisites

- Node.js >= 20.12.0
- pnpm >= 9.0.0

### Installation

1. Clone the repository:

```bash
git clone https://github.com/stsgs1980/unweave.git
cd unweave
```

2. Install dependencies:

```bash
pnpm install
```

3. Approve build scripts (first time only):

```bash
pnpm approve-builds
```

## Scripts

- `pnpm dev` — start Next.js development server
- `pnpm build` — build all packages
- `pnpm lint` — run ESLint
- `pnpm lint:fix` — fix ESLint issues automatically
- `pnpm format` — format code with Prettier
- `pnpm format:check` — check formatting
- `pnpm typecheck` — run TypeScript type checking
- `pnpm test` — run tests with Vitest
- `pnpm cli` — run CLI commands
- `pnpm mcp` — start MCP server
- `pnpm clean` — remove node_modules

## Architecture

Monorepo with four packages:

- `packages/core` — Core library (extract, analyze, spec, generate, pipeline)
- `packages/cli` — Command-line interface
- `packages/mcp` — MCP server for AI agents (Cursor, Claude, Windsurf)
- `packages/web` — Next.js web application with redesigned UI

Data flow: URL -> Playwright extraction -> Analysis (design system, components, patterns) -> Spec generation -> Code generation (React/Vue/HTML).

## Contributing

1. Create a new branch: `git checkout -b feat/your-feature`
2. Make a commit: `git commit -m "feat: add your feature"`
3. Push changes: `git push origin feat/your-feature`

## License

This project is licensed under the MIT License.
