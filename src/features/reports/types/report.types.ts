import type { TransactionType, PaymentMethod } from "@prisma/client";

/**
 * Ledrix — Report types.
 */

export type ReportFormat = "pdf" | "excel" | "csv";
export type ReportType = "worker-ledger" | "all-workers" | "date-range";

export interface LedgerReportEntry {
  date: string;
  type: TransactionType;
  reason: string;
  workName: string | null;
  rate: string | null;
  pieces: number | null;
  amount: string;
  paymentMethod: PaymentMethod | null;
  remarks: string | null;
  credit: string;
  debit: string;
  balance: string;
}

export interface WorkerLedgerReport {
  workspace: {
    name: string;
    currency: string;
  };
  worker: {
    name: string;
    mobile: string | null;
    address: string | null;
    openingBalance: string;
  };
  entries: LedgerReportEntry[];
  totals: {
    credit: number;
    debit: number;
    finalBalance: number;
  };
  generatedAt: string;
  period: {
    from: string;
    to: string;
  };
}

export interface ReportActionResult {
  success: boolean;
  message?: string;
}