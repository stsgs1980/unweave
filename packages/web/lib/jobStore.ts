/**
 * @file In-memory job store for managing background extraction tasks.
 */

export interface Job {
  id: string;
  status: "pending" | "processing" | "completed" | "failed";
  progress: number;
  result?: any;
  error?: string;
}

const jobs = new Map<string, Job>();

/**
 * Creates a new job and adds it to the store.
 * @param {string} id - The unique job ID.
 * @returns {Job} The created job object.
 */
export function createJob(id: string): Job {
  const job: Job = { id, status: "pending", progress: 0 };
  jobs.set(id, job);
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
 * Updates a job's status and progress.
 * @param {string} id - The job ID.
 * @param {Partial<Job>} updates - The fields to update.
 * @returns {void}
 */
export function updateJob(id: string, updates: Partial<Job>): void {
  const job = jobs.get(id);
  if (job) {
    Object.assign(job, updates);
  }
}
