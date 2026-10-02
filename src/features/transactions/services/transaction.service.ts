import { Prisma } from "@prisma/client";
import { logger } from "@/lib/logger";
import { Ok, Err, type Result } from "@/lib/result";
import { workerRepository } from "@/features/workers/repositories/worker.repository";
import {
  transactionRepository,
  type CreateTransactionData,
} from "../repositories/transaction.repository";
import type { TransactionFilters } from "../types/transaction.types";

/**
 * Ledrix — Transaction Service.
 *
 * Ledger convention:
 *   WORK       → + amount (owner owes worker more)
 *   DEDUCTION  → + amount (reduces what owner owes)
 *   PAYMENT    → - amount (owner paid)
 *   ADVANCE    → - amount (owner gave in advance)
 *
 * Running balance = openingBalance + sum(WORK + DEDUCTION) - sum(PAYMENT + ADVANCE)
 */
export class TransactionService {
  async create(params: {
    workspaceId: string;
    actorId: string;
    data: CreateTransactionData;
  }): Promise<Result<{ transactionId: string }, string>> {
    const { workspaceId, data, actorId } = params;

    // Verify worker belongs to workspace
    const worker = await workerRepository.findById({
      workspaceId,
      id: data.workerId,
    });

    if (!worker) {
      return Err("Worker not found");
    }

    const tx = await transactionRepository.create({
      workspaceId,
      data,
    });

    logger.info("Transaction created", {
      transactionId: tx.id,
      workspaceId,
      workerId: data.workerId,
      type: data.type,
      amount: data.amount,
      actorId,
    });

    return Ok({ transactionId: tx.id });
  }

  async list(params: {
    workspaceId: string;
    filters?: TransactionFilters;
    page?: number;
    pageSize?: number;
  }) {
    const {
      workspaceId,
      filters,
      page = 1,
      pageSize = 20,
    } = params;

    const skip = (page - 1) * pageSize;

    return transactionRepository.findMany({
      workspaceId,
      filters,
      skip,
      take: pageSize,
    });
  }

  /**
   * Worker running ledger with computed balances.
   */
  async getWorkerLedger(params: {
    workspaceId: string;
    workerId: string;
  }) {
    const { workspaceId, workerId } = params;

    const worker = await workerRepository.findById({
      workspaceId,
      id: workerId,
    });

    if (!worker) {
      return null;
    }

    const transactions = (await transactionRepository.findByWorker({
      workspaceId,
      workerId,
    })) as Array<{
      id: string;
      workspaceId: string;
      workerId: string;
      type: "WORK" | "PAYMENT" | "ADVANCE" | "DEDUCTION";
      reason: string;
      workName: string | null;
      rate: Prisma.Decimal | null;
      pieces: number | null;
      amount: Prisma.Decimal;
      paymentMethod:
        | "CASH"
        | "UPI"
        | "BANK_TRANSFER"
        | "CHEQUE"
        | "OTHER"
        | null;
      remarks: string | null;
      date: Date;
      createdAt: Date;
      updatedAt: Date;
      deletedAt: Date | null;
      worker?: {
        name: string;
      };
    }>;

    let balance = new Prisma.Decimal(worker.openingBalance);

    const items = transactions.map((tx) => {
      const amt = tx.amount;

      switch (tx.type) {
        case "WORK":
        case "DEDUCTION":
          balance = balance.add(amt);
          break;

        case "PAYMENT":
        case "ADVANCE":
          balance = balance.sub(amt);
          break;
      }

      return {
        tx,
        runningBalance: balance.toString(),
      };
    });

    return {
      worker,
      items,
      finalBalance: balance.toString(),
      totals: await transactionRepository.sumByType({
        workspaceId,
        workerId,
      }),
    };
  }

  async todayTotals(workspaceId: string) {
    return transactionRepository.todayTotals(workspaceId);
  }

  async update(params: {
    workspaceId: string;
    actorId: string;
    id: string;
    data: CreateTransactionData;
  }): Promise<Result<{ transactionId: string }, string>> {
    const {
      workspaceId,
      actorId,
      id,
      data,
    } = params;

    const worker = await workerRepository.findById({
      workspaceId,
      id: data.workerId,
    });

    if (!worker) {
      return Err("Worker not found");
    }

    const tx = await transactionRepository.update({
      workspaceId,
      id,
      data,
    });

    if (!tx) {
      return Err("Transaction not found");
    }

    logger.info("Transaction updated", {
      transactionId: id,
      workspaceId,
      actorId,
    });

    return Ok({
      transactionId: id,
    });
  }

  async softDelete(params: {
    workspaceId: string;
    actorId: string;
    id: string;
  }): Promise<Result<void, string>> {
    const tx = await transactionRepository.softDelete({
      workspaceId: params.workspaceId,
      id: params.id,
    });

    if (!tx) {
      return Err("Transaction not found");
    }

    logger.info("Transaction deleted", {
      transactionId: params.id,
      workspaceId: params.workspaceId,
      actorId: params.actorId,
    });

    return Ok(undefined);
  }

  async getById(params: {
    workspaceId: string;
    id: string;
  }) {
    return transactionRepository.findById(params);
  }
}

export const transactionService = new TransactionService();