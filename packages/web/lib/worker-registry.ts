/**
 * @file Registry of running extraction workers and cancelled jobs.
 * Lives on globalThis so Next.js hot reloads keep a single instance.
 */

import type { Worker } from "worker_threads";

interface WorkerRegistryGlobal {
  __unweaveWorkers?: Map<string, Worker>;
  __unweaveCancelledJobs?: Set<string>;
}

const g = globalThis as unknown as WorkerRegistryGlobal;

if (!g.__unweaveWorkers) g.__unweaveWorkers = new Map();
if (!g.__unweaveCancelledJobs) g.__unweaveCancelledJobs = new Set();

const workers: Map<string, Worker> = g.__unweaveWorkers;
const cancelledJobs: Set<string> = g.__unweaveCancelledJobs;

/**
 * Registers a running worker for a job.
 * @param {string} jobId - The extraction job ID.
 * @param {Worker} worker - The worker thread handle.
 */
export function registerWorker(jobId: string, worker: Worker): void {
  workers.set(jobId, worker);
}

/**
 * Terminates the worker thread for a job, if one is running.
 * @param {string} jobId - The extraction job ID.
 * @returns {Promise<boolean>} True when a worker was found and terminated.
 */
export async function terminateWorker(jobId: string): Promise<boolean> {
  const worker = workers.get(jobId);
  if (!worker) return false;
  workers.delete(jobId);
  try {
    await worker.terminate();
    return true;
  } catch {
    return false;
  }
}

/**
 * Unregisters a finished worker without terminating it.
 * @param {string} jobId - The extraction job ID.
 */
export function unregisterWorker(jobId: string): void {
  workers.delete(jobId);
}

/**
 * Marks a job as cancelled by the user.
 * @param {string} jobId - The extraction job ID.
 */
export function markJobCancelled(jobId: string): void {
  cancelledJobs.add(jobId);
}

/**
 * Checks whether a job was cancelled, so late worker messages can be dropped.
 * @param {string} jobId - The extraction job ID.
 * @returns {boolean} True when the job was cancelled.
 */
export function isJobCancelled(jobId: string): boolean {
  return cancelledJobs.has(jobId);
}
