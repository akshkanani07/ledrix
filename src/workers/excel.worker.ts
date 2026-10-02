import { Worker, Job } from "bullmq";
import { redis } from "@/lib/redis";
import { logger } from "@/lib/logger";
import { reportService } from "@/features/reports/services/report.service";
import { generateWorkerLedgerExcel } from "@/features/reports/generators/excel.generator";
import { QUEUE_NAMES } from "@/lib/queue";
import type {
  ExcelGenerationJobData,
  ExcelGenerationJobResult,
} from "@/lib/queue-types";

export function startExcelWorker() {
  if (!redis) {
    logger.warn("[Excel Worker] Redis not available — worker skipped");
    return null;
  }

  const worker = new Worker<ExcelGenerationJobData, ExcelGenerationJobResult>(
    QUEUE_NAMES.EXCEL_GENERATION,
    async (job: Job<ExcelGenerationJobData>) => {
      const { workspaceId, workerId } = job.data;

      logger.info("[Excel Worker] Processing", { jobId: job.id });

      const report = await reportService.getWorkerLedgerReport({
        workspaceId,
        workerId,
      });

      if (!report) {
        throw new Error("Worker not found");
      }

      await job.updateProgress(50);

      const buffer = await generateWorkerLedgerExcel(report);
      await job.updateProgress(100);

      const filename = `ledger-${report.worker.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")}-${new Date()
        .toISOString()
        .slice(0, 10)}.xlsx`;

      logger.info("[Excel Worker] Completed", { jobId: job.id });

      return {
        success: true,
        buffer: buffer.toString("base64"),
        filename,
      };
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

  worker.on("failed", (job, err) => {
    logger.error("[Excel Worker] Failed", {
      jobId: job?.id,
      error: err.message,
    });
  });

  logger.info("[Excel Worker] Started");
  return worker;
}