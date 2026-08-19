/**
 * @file In-memory job store with EventEmitter for SSE support.
 */

import { EventEmitter } from "events";

export interface Job {
  id: string;
  url?: string; // Добавляем URL для отображения в виджете
  status: "pending" | "processing" | "completed" | "failed";
  progress: number;
  message?: string;
  result?: any;
  error?: string;
}

const jobs = new Map<string, Job>();
const emitter = new EventEmitter();

/**
 * Creates a new job and adds it to the store.
 * @param {string} id - The unique job ID.
 * @param {string} [url] - The URL being extracted.
 * @returns {Job} The created job object.
 */
export function createJob(id: string, url?: string): Job {
  const job: Job = { id, url, status: "pending", progress: 0 };
  jobs.set(id, job);
  emitter.emit("update", job);
  return job;
}

/**
 * Retrieves a job by its ID.
 * @param {string} id - The job ID.
 * @returns {Job | undefined} The job object or undefined if not found.
 */
export function getJob(id: string): Job | undefined {
  return jobs.get(id);
}

/**
 * Retrieves all currently active jobs.
 * @returns {Job[]} Array of active jobs.
 */
export function getActiveJobs(): Job[] {
  return Array.from(jobs.values()).filter(
    (j) => j.status === "pending" || j.status === "processing",
  );
}

/**
 * Updates a job's status and progress, then emits the update.
 * @param {string} id - The job ID.
 * @param {Partial<Job>} updates - The fields to update.
 * @returns {void}
 */
export function updateJob(id: string, updates: Partial<Job>): void {
  const job = jobs.get(id);
  if (job) {
    Object.assign(job, updates);
    emitter.emit("update", job);
  }
}

/**
 * Subscribes to job updates.
 * @param {(job: Job) => void} cb - The callback to execute on update.
 * @returns {() => void} Unsubscribe function.
 */
export function subscribe(cb: (job: Job) => void): () => void {
  emitter.on("update", cb);
  return () => emitter.off("update", cb);
}
