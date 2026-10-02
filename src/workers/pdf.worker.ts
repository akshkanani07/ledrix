import { Worker, Job } from "bullmq";
import { redis } from "@/lib/redis";
import { logger } from "@/lib/logger";
import { reportService } from "@/features/reports/services/report.service";
import { generateWorkerLedgerPDF } from "@/features/reports/generators/pdf.generator";
import { QUEUE_NAMES } from "@/lib/queue";
import type {
  PDFGenerationJobData,
  PDFGenerationJobResult,
} from "@/lib/queue-types";

/**
 * Ledrix — PDF Generation Worker.
 * Processes PDF generation jobs in background.
 */

export function startPDFWorker() {
  if (!redis) {
    logger.warn("[PDF Worker] Redis not available — worker skipped");
    return null;
  }

  const worker = new Worker<PDFGenerationJobData, PDFGenerationJobResult>(
    QUEUE_NAMES.PDF_GENERATION,
    async (job: Job<PDFGenerationJobData>) => {
      const { workspaceId, workerId, userId } = job.data;

      logger.info("[PDF Worker] Processing job", {
        jobId: job.id,
        workspaceId,
        workerId,
      });

      try {
        await job.updateProgress(10);

        const report = await reportService.getWorkerLedgerReport({
          workspaceId,
          workerId,
        });

        if (!report) {
          throw new Error("Worker not found");
        }

        await job.updateProgress(40);

        const buffer = await generateWorkerLedgerPDF(report);

        await job.updateProgress(90);

        const filename = `ledger-${report.worker.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")}-${new Date()
          .toISOString()
          .slice(0, 10)}.pdf`;

        await job.updateProgress(100);

        logger.info("[PDF Worker] Job completed", {
          jobId: job.id,
          size: buffer.length,
        });

        return {
          success: true,
          buffer: buffer.toString("base64"),
          filename,
        };
      } catch (error) {
        logger.error("[PDF Worker] Job failed", {
          jobId: job.id,
          error: error instanceof Error ? error.message : "Unknown error",
        });
        throw error;
      }
    },
    {
      connection: {
        host: redis.options.host ?? "localhost",
        port: redis.options.port ?? 6379,
        password: redis.options.password,
        db: redis.options.db ?? 0,
        maxRetriesPerRequest: null,
      },
      concurrency: 3,
    }
  );

  worker.on("completed", (job) => {
    logger.info("[PDF Worker] Completed", { jobId: job.id });
  });

  worker.on("failed", (job, err) => {
    logger.error("[PDF Worker] Failed", {
      jobId: job?.id,
      error: err.message,
    });
  });

  worker.on("error", (err) => {
    logger.error("[PDF Worker] Error", { error: err.message });
  });

  logger.info("[PDF Worker] Started");
  return worker;
}