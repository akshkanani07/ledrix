import { Worker, Job } from "bullmq";
import { redis } from "@/lib/redis";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { QUEUE_NAMES } from "@/lib/queue";
import type { CleanupJobData, CleanupJobResult } from "@/lib/queue-types";

export function startCleanupWorker() {
  if (!redis) {
    logger.warn("[Cleanup Worker] Redis not available — worker skipped");
    return null;
  }

  const worker = new Worker<CleanupJobData, CleanupJobResult>(
    QUEUE_NAMES.CLEANUP,
    async (job: Job<CleanupJobData>) => {
      const { type, olderThanDays = 30 } = job.data;

      logger.info("[Cleanup Worker] Processing", { type, olderThanDays });

      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - olderThanDays);

      let deletedCount = 0;

      if (type === "soft-deleted" || type === "all") {
        const workers = await prisma.worker.deleteMany({
          where: { deletedAt: { lt: cutoff } },
        });
        const txns = await prisma.transaction.deleteMany({
          where: { deletedAt: { lt: cutoff } },
        });
        deletedCount += workers.count + txns.count;
      }

      if (type === "sessions" || type === "all") {
        const sessions = await prisma.session.deleteMany({
          where: { expiresAt: { lt: new Date() } },
        });
        deletedCount += sessions.count;
      }

      logger.info("[Cleanup Worker] Completed", { deletedCount });

      return { success: true, deletedCount };
    },
    {
      connection: {
        host: redis.options.host ?? "localhost",
        port: redis.options.port ?? 6379,
        password: redis.options.password,
        db: redis.options.db ?? 0,
        maxRetriesPerRequest: null,
      },
      concurrency: 1,
    }
  );

  worker.on("failed", (job, err) => {
    logger.error("[Cleanup Worker] Failed", {
      jobId: job?.id,
      error: err.message,
    });
  });

  logger.info("[Cleanup Worker] Started");
  return worker;
}