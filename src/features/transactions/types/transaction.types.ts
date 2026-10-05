import type {
  Transaction,
  TransactionType,
  PaymentMethod,
} from "@prisma/client";
import type { TransactionCreateInput } from "../schemas/transaction.schema";

export type {
  Transaction,
  TransactionType,
  PaymentMethod,
  TransactionCreateInput,
};

export interface TransactionFilters {
  workerId?: string;
  type?: TransactionType | "ALL";
  search?: string;
  fromDate?: string;
  toDate?: string;
}

/**
 * Client-safe transaction DTO.
 */
export interface TransactionListItem {
  id: string;
  workerId: string;
  workerName: string;
  type: TransactionType;
  reason: string;
  workName: string | null;
  rate: string | null;
  pieces: number | null;
  amount: string;
  paymentMethod: PaymentMethod | null;
  remarks: string | null;
  date: string;
  createdAt: string;
  runningBalance: string;
}

/**
 * Prisma Transaction → DTO.
 * `worker` is optional — some queries skip the relation join.
 */
export function toTransactionListItem(
  tx: Transaction & { worker?: { name: string } },
  runningBalance?: string
): TransactionListItem {
  return {
    id: tx.id,
    workerId: tx.workerId,
    workerName: tx.worker?.name ?? "",
    type: tx.type,
    reason: tx.reason,
    workName: tx.workName,
    rate: tx.rate?.toString() ?? null,
    pieces: tx.pieces,
    amount: tx.amount.toString(),
    paymentMethod: tx.paymentMethod,
    remarks: tx.remarks,
    date: tx.date.toISOString(),
    createdAt: tx.createdAt.toISOString(),
    runningBalance: runningBalance ?? "0",
  };
}

export interface TransactionActionResult {
  success: boolean;
  message?: string;
  fieldErrors?: Record<string, string[]>;
  transactionId?: string;
}