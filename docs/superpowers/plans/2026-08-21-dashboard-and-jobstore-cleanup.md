# Dashboard and JobStore Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement stale job cleanup on server startup, update projects API to query Prisma for recent completed jobs, create stats API, and wire up dashboard stats cards with real database and API data.

**Architecture:** Add `cleanupStaleJobs()` to `jobStore.ts` to mark pending/processing jobs as failed on restart. Invoke it in `/api/events/route.ts` on SSE stream initialization. Replace file reading in `/api/projects/route.ts` with a Prisma query fetching the 5 most recent completed jobs. Create `/api/stats/route.ts` to count completed jobs for the dashboard. Update `page.tsx` to render real metrics for extracted components and saved references.

**Tech Stack:** Next.js 16, TypeScript (strict), Prisma, Tailwind CSS, TanStack Query, Vitest.

## Global Constraints

- TypeScript strict mode enabled.
- Double quotes for strings.
- Comprehensive JSDoc comments for all exported functions and components.
- Platform: Windows / Node.js, pnpm workspace.

---

### Task 1: Add cleanupStaleJobs to jobStore.ts

**Files:**

- Modify: `packages/web/lib/jobStore.ts`

**Interfaces:**

- Consumes: Prisma `prisma.job.updateMany`
- Produces: `export async function cleanupStaleJobs(): Promise<void>`

- [ ] **Step 1: Write `cleanupStaleJobs` function in `jobStore.ts`**

```typescript
/**
 * Cleans up stale jobs by marking pending or processing jobs as failed due to server restart.
 * @returns {Promise<void>}
 */
export async function cleanupStaleJobs(): Promise<void> {
  logger.info("JobStore", "Cleaning up stale jobs");
  try {
    const result = await prisma.job.updateMany({
      where: {
        OR: [{ status: "pending" }, { status: "processing" }],
      },
      data: {
        status: "failed",
        error: "Server restarted",
      },
    });
    logger.info("JobStore", `Cleaned up ${result.count} stale jobs`);
  } catch (error) {
    logger.error("JobStore", "Failed to cleanup stale jobs", error);
    throw error;
  }
}
```

- [ ] **Step 2: Run typecheck to verify `jobStore.ts` compiles**

Run: `pnpm --filter @unweave/web typecheck`
Expected: PASS

---

### Task 2: Invoke cleanupStaleJobs in SSE events route

**Files:**

- Modify: `packages/web/app/api/events/route.ts`

**Interfaces:**

- Consumes: `cleanupStaleJobs` from `@/lib/jobStore`
- Produces: Server-sent events endpoint calling `cleanupStaleJobs()` on client connect/stream start.

- [ ] **Step 1: Import and call `cleanupStaleJobs` in `events/route.ts`**

```typescript
import { subscribe, getActiveJobs, cleanupStaleJobs, Job } from "@/lib/jobStore";
```

Inside `start(controller)`, before `getActiveJobs()`:

```typescript
await cleanupStaleJobs();
const jobs = await getActiveJobs();
```

- [ ] **Step 2: Run typecheck**

Run: `pnpm --filter @unweave/web typecheck`
Expected: PASS

---

### Task 3: Update projects API route and create stats API route

**Files:**

- Modify: `packages/web/app/api/projects/route.ts`
- Create: `packages/web/app/api/stats/route.ts`

**Interfaces:**

- Consumes: Prisma client
- Produces: GET `/api/projects` returning 5 recent completed jobs; GET `/api/stats` returning `{ completedCount: number }`.

- [ ] **Step 1: Update `packages/web/app/api/projects/route.ts`**

```typescript
/**
 * @file API route for fetching recent completed projects from Prisma.
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";

/**
 * Handles GET requests to retrieve a list of 5 recent completed jobs.
 * @returns {Promise<NextResponse>} A JSON response containing an array of projects.
 */
export async function GET(): Promise<NextResponse> {
  try {
    logger.info("API:Projects", "Fetching 5 recent completed jobs from Prisma");
    const jobs = await prisma.job.findMany({
      where: { status: "completed" },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    const projects = jobs.map((job) => ({
      id: job.id,
      name: job.url || "Untitled Project",
      url: job.url || "https://unknown.com",
      date: job.createdAt.toISOString(),
      status: (job.status.charAt(0).toUpperCase() + job.status.slice(1)) as
        "Completed" | "Failed" | "Processing",
    }));

    logger.info("API:Projects", `Successfully fetched ${projects.length} recent projects`);
    return NextResponse.json(projects);
  } catch (error) {
    logger.error("API:Projects", "Failed to fetch recent projects from Prisma", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
```

- [ ] **Step 2: Create `packages/web/app/api/stats/route.ts`**

```typescript
/**
 * @file API route for fetching dashboard statistics from Prisma.
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";

/**
 * Handles GET requests to retrieve dashboard statistics.
 * @returns {Promise<NextResponse>} A JSON response containing statistics.
 */
export async function GET(): Promise<NextResponse> {
  try {
    logger.info("API:Stats", "Fetching dashboard stats from Prisma");
    const completedCount = await prisma.job.count({
      where: { status: "completed" },
    });

    return NextResponse.json({
      completedCount,
    });
  } catch (error) {
    logger.error("API:Stats", "Failed to fetch stats from Prisma", error);
    return NextResponse.json(
      { error: "Internal Server Error", completedCount: 0 },
      { status: 500 },
    );
  }
}
```

- [ ] **Step 3: Run typecheck**

Run: `pnpm --filter @unweave/web typecheck`
Expected: PASS

---

### Task 4: Update Dashboard (`page.tsx`) to use real stats

**Files:**

- Modify: `packages/web/app/page.tsx`

**Interfaces:**

- Consumes: `/api/stats` and `/api/projects`
- Produces: Updated Dashboard displaying real stats for "Components Extracted" and "References Saved".

- [ ] **Step 1: Add stats query and update StatsCards in `page.tsx`**

```typescript
// Получаем статистику выполненных компонентов
const { data: stats } = useQuery<{ completedCount: number }>({
  queryKey: ["stats"],
  queryFn: async () => {
    const response = await fetch("/api/stats");
    if (!response.ok) {
      throw new Error("Failed to load stats");
    }
    return response.json();
  },
});

const completedCount = stats?.completedCount ?? 0;
```

And update StatsCard:

```typescript
          <StatsCard
            title="Components Extracted"
            value={completedCount}
            description="Total completed extractions"
            data={[10, 15, 12, 20, 18, 25, 30, 28, completedCount]}
          />
          <StatsCard
            title="Design Tokens"
            value={0}
            description="Updated recently"
            data={[0, 0, 0, 0]}
          />
          <StatsCard
            title="References Saved"
            value={projectsData.length}
            description="Synced with database"
            data={[1, 3, 2, 4, 5, 4, 6, projectsData.length]}
          />
```

- [ ] **Step 2: Run typecheck, lint, build, and test**

Run: `pnpm typecheck; pnpm lint; pnpm test run; pnpm build`
Expected: All pass successfully.

- [ ] **Step 3: Commit changes**

```bash
git add packages/web/lib/jobStore.ts packages/web/app/api/events/route.ts packages/web/app/api/projects/route.ts packages/web/app/api/stats/route.ts packages/web/app/page.tsx docs/superpowers/plans/
git commit -m "feat: add stale job cleanup, Prisma projects API, and real dashboard stats" --trailer "Co-authored-by: Junie <junie@jetbrains.com>"
```
