import { PrismaClient } from "@prisma/client";
import { logger } from "./logger";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: [
      { emit: "event", level: "error" },
      { emit: "event", level: "warn" },
    ],
    datasources: {
      db: {
        url: (() => {
          const baseUrl = process.env.DATABASE_URL || "";
          const hasParams = baseUrl.includes("?");
          const hasConnectionLimit = baseUrl.includes("connection_limit=");
          const hasPoolTimeout = baseUrl.includes("pool_timeout=");

          if (hasConnectionLimit && hasPoolTimeout) {
            return baseUrl;
          }

          const params: string[] = [];
          if (!hasConnectionLimit) params.push("connection_limit=20");
          if (!hasPoolTimeout) params.push("pool_timeout=60");

          return baseUrl + (hasParams ? "&" : "?") + params.join("&");
        })(),
      },
    },
  });

// @ts-ignore
prisma.$on("error", (e: any) => {
  logger.error("Database", "Prisma client error", e);
});

// @ts-ignore
prisma.$on("warn", (e: any) => {
  logger.warn("Database", "Prisma client warning", e);
});

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
  logger.info("Database", "Initialized Prisma Client in non-production mode");
} else {
  logger.info("Database", "Initialized Prisma Client in production mode");
}
