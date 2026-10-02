import { pdfQueue, excelQueue, emailQueue, cleanupQueue } from "@/lib/queue";
import { logger } from "@/lib/logger";

/**
 * Ledrix — Queue utilities for common operations.
 */

export const queueUtils = {
  /**
   * Get queue stats.
   */
  async getStats() {
    const [pdf, excel, email, cleanup] = await Promise.all([
      pdfQueue.getJobCounts(),
      excelQueue.getJobCounts(),
      emailQueue.getJobCounts(),
      cleanupQueue.getJobCounts(),
    ]);

    return {
      pdf,
      excel,
      email,
      cleanup,
    };
  },

  /**
   * Enqueue PDF generation.
   */
  async enqueuePDF(data: {
    workspaceId: string;
    workerId: string;
    userId: string;
  }) {
    const job = await pdfQueue.add("generate", {
      ...data,
      requestedAt: new Date().toISOString(),
    });

    logger.info("[Queue] PDF job enqueued", { jobId: job.id });
    return job;
  },

  /**
   * Enqueue Excel generation.
   */
  async enqueueExcel(data: {
    workspaceId: string;
    workerId: string;
    userId: string;
  }) {
    const job = await excelQueue.add("generate", {
      ...data,
      requestedAt: new Date().toISOString(),
    });

    logger.info("[Queue] Excel job enqueued", { jobId: job.id });
    return job;
  },

  /**
   * Schedule daily cleanup at 3 AM.
   */
  async scheduleDailyCleanup() {
    await cleanupQueue.add(
      "daily-cleanup",
      { type: "all", olderThanDays: 30 },
      {
        repeat: {
          pattern: "0 3 * * *", // 3 AM daily
        },
        jobId: "daily-cleanup", // prevent duplicates
      }
    );

    logger.info("[Queue] Daily cleanup scheduled");
  },

  /**
   * Cancel a job.
   */
  async cancelJob(queue: "pdf" | "excel" | "email" | "cleanup", jobId: string) {
    const q = {
      pdf: pdfQueue,
      excel: excelQueue,
      email: emailQueue,
      cleanup: cleanupQueue,
    }[queue];

    const job = await q.getJob(jobId);
    if (job) {
      await job.remove();
      logger.info("[Queue] Job cancelled", { queue, jobId });
      return true;
    }
    return false;
  },
};