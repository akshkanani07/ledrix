import { PrismaClient } from "@prisma/client";

/**
 * Ledrix — Prisma Client Singleton.
 *
 * In Next.js dev mode, hot-reload creates new module instances.
 * Without a global cache, this exhausts DB connections.
 * Solution: store client on `globalThis` in non-production.
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  return new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}