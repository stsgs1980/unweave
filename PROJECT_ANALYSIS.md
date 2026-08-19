# PROJECT ANALYSIS: unweave

## 1. Current Architecture

Monorepo managed by pnpm workspaces.

- `packages/core`: Playwright extraction, analysis, diffing, and code generation (JS).
- `packages/cli`: Command-line interface, pipeline orchestration, reference management.
- `packages/mcp`: Model Context Protocol server (planned).
- `packages/web`: Next.js 16 + React 19 + Tailwind v4 dashboard.

## 2. Completed Milestones

- [x] Core logic stabilized (React generation, SVG className normalization).
- [x] CLI pipeline refactored and extended with reference saving/loading and diffing.
- [x] Web scaffold initialized (Tailwind v4 theme, layout, fonts).
- [x] Dashboard UI implemented:
  - Hero `ExtractInput` with loading/error/success states.
  - `StatsCard` grid with metrics.
  - `RecentProjects` grid (fetches from API).
- [x] Global State & UI Features:
  - `CommandPalette` (Cmd+K) using `cmdk` and `zustand`.
- [x] Core Integration:
  - API Routes created (`/api/projects`, `/api/extract`).
  - `@unweave/core` linked to web package.
  - Type declarations (`types/core.d.ts`) added for JS core.
  - Extraction pipeline successfully called from Web UI.

## 3. Immediate Next Steps (Future Priorities)

- [ ] Implement actual background processing for long-running extractions (queues/workers).
- [ ] Build the 4-step Extract Wizard and Split-view Workspace UI.
- [ ] Implement reference saving from the CLI/UI to populate `Recent Projects`.
- [ ] Develop the MCP server package.
