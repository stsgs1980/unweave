/**
 * @file Job store using Prisma (PostgreSQL) and EventEmitter for SSE.
 */

import { EventEmitter } from "events";
import { prisma } from "./db";
import { logger } from "./logger";

export interface Job {
  id: string;
  url?: string;
  status: "pending" | "processing" | "completed" | "failed";
  progress: number;
  message?: string;
  result?: any;
  error?: string | null;
}

const emitter = new EventEmitter();

/**
 * Helper to retry database operations on transient errors.
 * Handles PostgreSQL (connection pool, timeouts) and SQLite (locked, busy).
 * Skips non-retryable errors (unique constraint, record not found).
 * @param fn
 * @param retries
 * @param delay
 */
export async function withDbRetry<T>(fn: () => Promise<T>, retries = 3, delay = 500): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    const code = error?.code;
    const message = error?.message?.toLowerCase() ?? "";

    // Non-retryable errors - throw immediately
    if (code === "P2002" || code === "P2025") {
      throw error;
    }

    // Retryable patterns: PostgreSQL + SQLite
    const isRetryable =
      retries > 0 &&
      (code === "P2024" ||
        message.includes("connection pool") ||
        message.includes("timed out") ||
        message.includes("connection") ||
        message.includes("database is locked") ||
        message.includes("sqlite_busy") ||
        message.includes("disk i/o error"));

    if (isRetryable) {
      logger.warn(
        "JobStore",
        `Database transient error, retrying... (${retries} attempts left)`,
        error,
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
      return withDbRetry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
}

/**
 * Creates a new job in the database.
 * @param {string} id - The unique job ID.
 * @param {string} url - The URL being extracted.
 * @returns {Promise<Job>} The created job object.
 */
export async function createJob(id: string, url: string): Promise<Job> {
  logger.info("JobStore", `Creating job ${id} for URL: ${url}`);
  try {
    const job = await withDbRetry(() =>
      prisma.job.create({
        data: { id, url, status: "pending", progress: 0 },
      }),
    );
    emitter.emit("update", job as Job);
    logger.info("JobStore", `Job ${id} created successfully`);
    return job as Job;
  } catch (error) {
    logger.error("JobStore", `Failed to create job ${id}`, error);
    throw error;
  }
}

/**
 * Retrieves a job by its ID from the database.
 * @param {string} id - The job ID.
 * @returns {Promise<Job | undefined>} The job object or undefined if not found.
 */
export async function getJob(id: string): Promise<Job | undefined> {
  logger.debug("JobStore", `Fetching job ${id}`);
  try {
    const job = await withDbRetry(() => prisma.job.findUnique({ where: { id } }));
    if (!job) {
      logger.debug("JobStore", `Job ${id} not found`);
    }
    return (job as Job) ?? undefined;
  } catch (error) {
    logger.error("JobStore", `Failed to fetch job ${id}`, error);
    throw error;
  }
}

/**
 * Retrieves all currently active jobs from the database.
 * @returns {Promise<Job[]>} Array of active jobs.
 */
export async function getActiveJobs(): Promise<Job[]> {
  logger.debug("JobStore", "Fetching active jobs");
  try {
    const jobs = await withDbRetry(() =>
      prisma.job.findMany({
        where: {
          OR: [{ status: "pending" }, { status: "processing" }],
        },
      }),
    );
    logger.debug("JobStore", `Found ${jobs.length} active jobs`);
    return jobs as Job[];
  } catch (error) {
    logger.error("JobStore", "Failed to fetch active jobs", error);
    throw error;
  }
}

/**
 * Updates a job's status and progress in the database, then emits the update.
 * @param {string} id - The job ID.
 * @param {Partial<Job>} updates - The fields to update.
 * @returns {Promise<void>}
 */
export async function updateJob(id: string, updates: Partial<Job>): Promise<void> {
  logger.info("JobStore", `Updating job ${id}`, updates);
  try {
    const job = await withDbRetry(() =>
      prisma.job.update({
        where: { id },
        data: updates,
      }),
    );
    emitter.emit("update", job as Job);
    logger.info("JobStore", `Job ${id} updated successfully`);
  } catch (error) {
    logger.error("JobStore", `Failed to update job ${id}`, error);
    throw error;
  }
}

/**
 * Cleans up stale jobs by marking pending or processing jobs inactive for > 5 minutes as failed.
 * @returns {Promise<void>}
 */
export async function cleanupStaleJobs(): Promise<void> {
  logger.info("JobStore", "Checking and cleaning up stale jobs (>5m inactivity)");
  const staleThreshold = new Date(Date.now() - 5 * 60 * 1000);
  try {
    const result = await withDbRetry(() =>
      prisma.job.updateMany({
        where: {
          OR: [{ status: "pending" }, { status: "processing" }],
          updatedAt: { lt: staleThreshold },
        },
        data: {
          status: "failed",
          error: "Job timed out or server restarted (inactive for > 5 min)",
        },
      }),
    );
    if (result.count > 0) {
      logger.info("JobStore", `Cleaned up ${result.count} stale jobs`);
    } else {
      logger.debug("JobStore", "No stale jobs found");
    }
  } catch (error) {
    logger.error("JobStore", "Failed to cleanup stale jobs", error);
    throw error;
  }
}

/**
 * Subscribes to job updates.
 * @param {(job: Job) => void} cb - The callback to execute on update.
 * @returns {() => void} Unsubscribe function.
 */
export function subscribe(cb: (job: Job) => void): () => void {
  logger.debug("JobStore", "New client subscribed to job updates");
  emitter.on("update", cb);
  return () => {
    logger.debug("JobStore", "Client unsubscribed from job updates");
    emitter.off("update", cb);
  };
}
