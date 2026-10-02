/**
 * Ledrix — BullMQ job data types.
 * Central type definitions for all queue payloads.
 */

export interface PDFGenerationJobData {
  workspaceId: string;
  workerId: string;
  userId: string;
  requestedAt: string;
}

export interface PDFGenerationJobResult {
  success: boolean;
  buffer?: string; // base64
  filename?: string;
  error?: string;
}

export interface ExcelGenerationJobData {
  workspaceId: string;
  workerId: string;
  userId: string;
  requestedAt: string;
}

export interface ExcelGenerationJobResult {
  success: boolean;
  buffer?: string;
  filename?: string;
  error?: string;
}

export interface EmailJobData {
  to: string;
  subject: string;
  html: string;
  attachments?: Array<{
    filename: string;
    content: string; // base64
  }>;
}

export interface EmailJobResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface CleanupJobData {
  type: "soft-deleted" | "cache" | "sessions" | "all";
  olderThanDays?: number;
}

export interface CleanupJobResult {
  success: boolean;
  deletedCount: number;
  error?: string;
}