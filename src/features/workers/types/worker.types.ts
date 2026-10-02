import type { Worker, WorkerStatus } from "@prisma/client";
import type { WorkerCreateInput } from "../schemas/worker.schema";

/**
 * Ledrix — Worker types.
 */

export type { Worker, WorkerStatus, WorkerCreateInput };

export interface WorkerFilters {
  search?: string;
  status?: WorkerStatus | "ALL";
}

export interface WorkerListItem {
  id: string;
  workspaceId: string;
  name: string;
  photo: string | null;
  mobile: string | null;
  address: string | null;
  notes: string | null;
  status: WorkerStatus;
  openingBalance: string;
  runningBalance: string;
  createdAt: string;
  updatedAt: string;
  transactionCount: number;
}

export interface WorkerDetail {
  id: string;
  workspaceId: string;
  name: string;
  photo: string | null;
  mobile: string | null;
  address: string | null;
  notes: string | null;
  status: WorkerStatus;
  openingBalance: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Map Prisma Worker → client-safe DTO.
 * Includes runningBalance if provided by repository.
 */
export function toWorkerListItem(
  worker: Worker & {
    _count?: { transactions: number };
    runningBalance?: number;
  }
): WorkerListItem {
  return {
    id: worker.id,
    workspaceId: worker.workspaceId,
    name: worker.name,
    photo: worker.photo,
    mobile: worker.mobile,
    address: worker.address,
    notes: worker.notes,
    status: worker.status,
    openingBalance: worker.openingBalance.toString(),
    runningBalance: (worker.runningBalance ?? Number(worker.openingBalance)).toFixed(2),
    createdAt: worker.createdAt.toISOString(),
    updatedAt: worker.updatedAt.toISOString(),
    transactionCount: worker._count?.transactions ?? 0,
  };
}

export function toWorkerDetail(worker: Worker): WorkerDetail {
  return {
    id: worker.id,
    workspaceId: worker.workspaceId,
    name: worker.name,
    photo: worker.photo,
    mobile: worker.mobile,
    address: worker.address,
    notes: worker.notes,
    status: worker.status,
    openingBalance: worker.openingBalance.toString(),
    createdAt: worker.createdAt.toISOString(),
    updatedAt: worker.updatedAt.toISOString(),
  };
}

export interface WorkerActionResult {
  success: boolean;
  message?: string;
  fieldErrors?: Record<string, string[]>;
  workerId?: string;
}