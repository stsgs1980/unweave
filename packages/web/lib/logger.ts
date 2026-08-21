/**
 * @file Application structured logger utility for debugging and tracking events.
 */

type LogLevel = "info" | "warn" | "error" | "debug";

/**
 *
 */
function formatTimestamp(): string {
  return new Date().toISOString();
}

export const logger = {
  info(module: string, message: string, data?: any) {
    const extra = data !== undefined ? ` | ${JSON.stringify(data)}` : "";
    console.log(`[${formatTimestamp()}] [INFO] [${module}] ${message}${extra}`);
  },
  warn(module: string, message: string, data?: any) {
    const extra = data !== undefined ? ` | ${JSON.stringify(data)}` : "";
    console.warn(`[${formatTimestamp()}] [WARN] [${module}] ${message}${extra}`);
  },
  error(module: string, message: string, error?: any) {
    const errDetails =
      error instanceof Error
        ? error.stack || error.message
        : error !== undefined
          ? JSON.stringify(error)
          : "";
    const extra = errDetails ? ` | Error: ${errDetails}` : "";
    console.error(`[${formatTimestamp()}] [ERROR] [${module}] ${message}${extra}`);
  },
  debug(module: string, message: string, data?: any) {
    if (process.env.NODE_ENV !== "production") {
      const extra = data !== undefined ? ` | ${JSON.stringify(data)}` : "";
      console.debug(`[${formatTimestamp()}] [DEBUG] [${module}] ${message}${extra}`);
    }
  },
};
