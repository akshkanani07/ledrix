/**
 * Ledrix — Worker Entry Point.
 * Run separately: npm run worker
 *
 * Production: deploy as a separate process (Railway/Render/VPS)
 * Development: run in second terminal
 */

import { startPDFWorker } from "../src/workers/pdf.worker";
import { startExcelWorker } from "../src/workers/excel.worker";
import { startCleanupWorker } from "../src/workers/cleanup.worker";
import { logger } from "../src/lib/logger";

logger.info("🚀 Starting Ledrix workers...");

const workers = [
  startPDFWorker(),
  startExcelWorker(),
  startCleanupWorker(),
];

const activeWorkers = workers.filter(Boolean);

if (activeWorkers.length === 0) {
  logger.error("❌ No workers started (Redis unavailable)");
  process.exit(1);
}

logger.info(`✅ Started ${activeWorkers.length} workers`);

// Graceful shutdown
async function shutdown() {
  logger.info("🛑 Shutting down workers...");
  await Promise.all(activeWorkers.map((w) => w?.close()));
  process.exit(0);
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);