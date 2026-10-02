import { Queue, type QueueOptions, type ConnectionOptions } from "bullmq";
import { redis } from "@/lib/redis";

/**
 * Ledrix — BullMQ Queue setup.
 */

function getConnection(): ConnectionOptions {
  if (!redis) {
    throw new Error("Redis client is not initialized.");
  }

  const host = redis.options.host;
  const port = redis.options.port;

  if (!host || !port) {
    throw new Error("Redis host or port is missing.");
  }

  return {
    host,
    port,
    password: redis.options.password,
    db: redis.options.db ?? 0,
    maxRetriesPerRequest: null,
  };
}

export const QUEUE_NAMES = {
  PDF_GENERATION: "pdf-generation",
  EXCEL_GENERATION: "excel-generation",
  EMAIL: "email",
  CLEANUP: "cleanup",
} as const;

const connection = getConnection();

const defaultOptions: QueueOptions = {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 2000,
    },
    removeOnComplete: {
      age: 24 * 3600,
      count: 1000,
    },
    removeOnFail: {
      age: 7 * 24 * 3600,
    },
  },
};

const globalForQueues = globalThis as unknown as {
  queues: Record<string, Queue> | undefined;
};

function createQueues(): Record<string, Queue> {
  return {
    [QUEUE_NAMES.PDF_GENERATION]: new Queue(
      QUEUE_NAMES.PDF_GENERATION,
      defaultOptions
    ),
    [QUEUE_NAMES.EXCEL_GENERATION]: new Queue(
      QUEUE_NAMES.EXCEL_GENERATION,
      defaultOptions
    ),
    [QUEUE_NAMES.EMAIL]: new Queue(
      QUEUE_NAMES.EMAIL,
      defaultOptions
    ),
    [QUEUE_NAMES.CLEANUP]: new Queue(
      QUEUE_NAMES.CLEANUP,
      defaultOptions
    ),
  };
}

export const queues = globalForQueues.queues ?? createQueues();

if (process.env.NODE_ENV !== "production") {
  globalForQueues.queues = queues;
}

export const pdfQueue = queues[QUEUE_NAMES.PDF_GENERATION];
export const excelQueue = queues[QUEUE_NAMES.EXCEL_GENERATION];
export const emailQueue = queues[QUEUE_NAMES.EMAIL];
export const cleanupQueue = queues[QUEUE_NAMES.CLEANUP];