# PROJECT ANALYSIS: unweave

## 1. Current Architecture
Monorepo managed by pnpm workspaces (v9.x/v11.x). Strict TypeScript & ESLint.
- `packages/core`: Playwright extraction, programmatic analysis, spec generation, React/Vue/HTML code generation, and diffing (JS + JSDoc).
- `packages/cli`: Command-line interface (12 commands) and pipeline orchestration.
- `packages/mcp`: Model Context Protocol server (3 tools: `extract_ui`, `list_references`, `compare_designs`).
- `packages/web`: Next.js 16 + React 19 + Tailwind CSS v4 dashboard (App Router).

## 2. Tech Stack Status
| Category | Technology | Status |
|----------|------------|--------|
| **Web Framework** | Next.js 16 (App Router) | [OK] Working |
| **UI Base** | shadcn/ui + Tailwind v4 | [WARN] Only 2 components generated (button, bento-grid). UI mostly uses raw Tailwind classes. |
| **Data Fetching** | TanStack Query v5 | [FAIL] Installed but NOT USED (manual fetch in useEffect). |
| **Server State** | Zustand | [OK] Working (Wizard state, UI state). |
| **Background Jobs** | Node.js Worker Threads | [OK] Working (Playwright runs in a separate thread, non-blocking). |
| **Real-time** | Server-Sent Events (SSE) | [OK] Working (Live Pipeline Stepper on Dashboard). |
| **Charts/Visuals** | Tremor React | [FAIL] Installed but NOT USED (StatsCards are static). |
| **Database** | Prisma + SQLite | [FAIL] Missing (Storage is file-system based in core/references.js). |

## 3. Completed Milestones
- [x] Core & CLI: Playwright extraction, diffing, and code generation stabilized. CLI fully functional.
- [x] Background Processing: Extractions run in Worker Threads (extract-worker.ts). Main Next.js event loop is unblocked.
- [x] Web Scaffold & Routing: App Router configured with global Navbar, ThemeProvider, and CommandPalette (Cmd+K).
- [x] Dashboard UI: Hero ExtractInput, StatsCard grid, RecentProjects grid.
- [x] Real-time Updates: LivePipelineWidget utilizes SSE (/api/events) to show active background jobs instantly.
- [x] Extract Wizard: 4-step flow (URL -> Options -> Progress -> Result) with framer-motion animations.
- [x] Workspace UI (Split-view): /workspace route with ComponentTree (left) and CodePreview (right).
- [x] Core Integration: Web API routes successfully call @unweave/core functions to generate real React code in the Workspace.
- [x] Tokens & References Pages: Basic UI created for viewing tokens and saved references.
- [x] MCP Server: Initialized with 3 tools for AI assistant integration (Cursor, Claude).
- [x] Testing & CI/CD: Vitest setup for core (2 tests). GitHub Actions workflow configured (lint, typecheck, test).

## 4. Immediate Next Steps (The Roadmap)

### Phase 1: UI Foundation & Refactoring (Priority: P0)
[GOAL] Clean up the code, use installed dependencies properly, and polish the existing UI.
- [ ] Integrate TanStack Query: Replace manual fetch + useEffect with useQuery/useMutation across all pages (Dashboard, Workspace, Tokens, References).
- [ ] Expand shadcn/ui: Generate and implement missing base components (input, card, dialog, tabs, table, toast).
- [ ] Integrate Tremor: Replace static numbers in StatsCard.tsx with Tremor's Sparkline or AreaChart.
- [ ] Add Toasts (Sonner): Implement user feedback for extraction success/failure instead of inline text.

### Phase 2: Advanced Workspace & Features (Priority: P1)
[GOAL] Deliver the wow factor and core value proposition for users.
- [ ] Workspace Live Preview: Add an iframe in CodePreview to visually render the generated React/HTML code (Code | Preview | Split tabs).
- [ ] Component Detail Page: Create a detailed view for a single component (Props table, Variants, Accessibility checklist).
- [ ] Interactive Token Editor: Upgrade /tokens from read-only to interactive (Color pickers, Spacing sliders) with an Apply to Project button.
- [ ] Export Dialog: Implement a modal to download the generated code as a ZIP archive (using jszip) or copy to clipboard.
- [ ] Magic UI Integration: Add subtle animations (e.g., AutoAnimate for the component list, bento-grid for dashboard).

### Phase 3: Persistence & Production (Priority: P2)
[GOAL] Make the app stateful and ready for multi-user environments.
- [ ] Database (Prisma + SQLite): Replace file-system storage (references/) with a Prisma database schema (Project, Component, Token, Reference).
- [ ] Authentication: Implement NextAuth.js or Clerk for user login and project isolation.
- [ ] Comprehensive Testing: Add unit tests for web components and E2E tests (Playwright) for the extraction pipeline.
