/**
 * @file Application structured logger utility for debugging and tracking events.
 */

export type LogLevel = "info" | "warn" | "error" | "debug";

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  module: string;
  message: string;
  data?: any;
}

/**
 * Formats the current date and time as an ISO string.
 * @returns {string} The formatted ISO timestamp string.
 */
function formatTimestamp(): string {
  return new Date().toISOString();
}

const MAX_LOG_ENTRIES = 1000;

// Persistent in-memory log storage across Next.js module reloads and dev compilations
const globalForLogs = globalThis as unknown as {
  __unweaveLogStore?: LogEntry[];
};

if (!globalForLogs.__unweaveLogStore) {
  globalForLogs.__unweaveLogStore = [];
}

const logStore: LogEntry[] = globalForLogs.__unweaveLogStore;

/**
 * Adds a structured log entry to the central log store.
 * @param {LogEntry} entry - The log entry to append.
 */
export function addLogEntry(entry: LogEntry): void {
  logStore.push(entry);
  if (logStore.length > MAX_LOG_ENTRIES) {
    logStore.shift();
  }
}

export interface GetLogsOptions {
  limit?: number;
  level?: LogLevel | "all";
  module?: string;
}

/**
 * Retrieves log entries with optional filtering.
 * @param {GetLogsOptions} [options] - Filter and limit options.
 * @returns {LogEntry[]} An array of log entries.
 */
export function getLogs(options?: GetLogsOptions): LogEntry[] {
  let logs = [...logStore];
  if (options?.level && options.level !== "all") {
    logs = logs.filter((l) => l.level === options.level);
  }
  if (options?.module) {
    const modLower = options.module.toLowerCase();
    logs = logs.filter((l) => l.module.toLowerCase().includes(modLower));
  }
  if (options?.limit && options.limit > 0) {
    logs = logs.slice(-options.limit);
  }
  return logs;
}

/**
 * Clears all stored log entries.
 */
export function clearLogs(): void {
  logStore.length = 0;
}

export const logger = {
  info(module: string, message: string, data?: any) {
    const entry: LogEntry = {
      timestamp: formatTimestamp(),
      level: "info",
      module,
      message,
      data,
    };
    addLogEntry(entry);
    const extra = data !== undefined ? ` | ${JSON.stringify(data)}` : "";
    console.log(`[${entry.timestamp}] [INFO] [${module}] ${message}${extra}`);
  },
  warn(module: string, message: string, data?: any) {
    const entry: LogEntry = {
      timestamp: formatTimestamp(),
      level: "warn",
      module,
      message,
      data,
    };
    addLogEntry(entry);
    const extra = data !== undefined ? ` | ${JSON.stringify(data)}` : "";
    console.warn(`[${entry.timestamp}] [WARN] [${module}] ${message}${extra}`);
  },
  error(module: string, message: string, error?: any) {
    const errDetails =
      error instanceof Error
        ? error.stack || error.message
        : error !== undefined
          ? JSON.stringify(error)
          : "";
    const entry: LogEntry = {
      timestamp: formatTimestamp(),
      level: "error",
      module,
      message,
      data: errDetails ? { error: errDetails } : undefined,
    };
    addLogEntry(entry);
    const extra = errDetails ? ` | Error: ${errDetails}` : "";
    console.error(`[${entry.timestamp}] [ERROR] [${module}] ${message}${extra}`);
  },
  debug(module: string, message: string, data?: any) {
    const entry: LogEntry = {
      timestamp: formatTimestamp(),
      level: "debug",
      module,
      message,
      data,
    };
    addLogEntry(entry);
    if (process.env.NODE_ENV !== "production") {
      const extra = data !== undefined ? ` | ${JSON.stringify(data)}` : "";
      console.debug(`[${entry.timestamp}] [DEBUG] [${module}] ${message}${extra}`);
    }
  },
};
