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
        url:
          process.env.DATABASE_URL +
          (process.env.DATABASE_URL?.includes("?") ? "&" : "?") +
          "connection_limit=1&pool_timeout=20",
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
