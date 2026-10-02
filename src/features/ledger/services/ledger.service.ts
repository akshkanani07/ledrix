import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { workerRepository } from "@/features/workers/repositories/worker.repository";
import { transactionRepository } from "@/features/transactions/repositories/transaction.repository";

/**
 * Ledrix — Ledger Service.
 *
 * Running ledger = worker's chronological transaction history
 * with balance calculated after each entry.
 *
 * Convention:
 *   WORK       → + amount
 *   DEDUCTION  → + amount
 *   PAYMENT    → - amount
 *   ADVANCE    → - amount
 */
export class LedgerService {
  /**
   * Overview of all workers with current running balance.
   */
  async getOverview(workspaceId: string) {
    const workers = await prisma.worker.findMany({
      where: { workspaceId, deletedAt: null },
      orderBy: { name: "asc" },
    });

    if (workers.length === 0) {
      return {
        workers: [],
        totals: {
          totalWorkers: 0,
          totalOwed: 0,
          totalOwes: 0,
          netBalance: 0,
        },
      };
    }

    const workerIds = workers.map((w) => w.id);

    const [credits, debits] = await Promise.all([
      prisma.transaction.groupBy({
        by: ["workerId"],
        where: {
          workspaceId,
          workerId: { in: workerIds },
          deletedAt: null,
          type: { in: ["WORK", "DEDUCTION"] },
        },
        _sum: { amount: true },
      }),
      prisma.transaction.groupBy({
        by: ["workerId"],
        where: {
          workspaceId,
          workerId: { in: workerIds },
          deletedAt: null,
          type: { in: ["PAYMENT", "ADVANCE"] },
        },
        _sum: { amount: true },
      }),
    ]);

    const creditMap = new Map(
      credits.map((c) => [c.workerId, Number(c._sum.amount ?? 0)])
    );
    const debitMap = new Map(
      debits.map((c) => [c.workerId, Number(c._sum.amount ?? 0)])
    );

    const items = workers.map((w) => {
      const opening = Number(w.openingBalance);
      const credit = creditMap.get(w.id) ?? 0;
      const debit = debitMap.get(w.id) ?? 0;
      const balance = opening + credit - debit;

      return {
        id: w.id,
        name: w.name,
        photo: w.photo,
        mobile: w.mobile,
        status: w.status,
        openingBalance: opening.toFixed(2),
        totalCredit: credit.toFixed(2),
        totalDebit: debit.toFixed(2),
        balance: balance.toFixed(2),
      };
    });

    const totalOwed = items
      .filter((i) => Number(i.balance) > 0)
      .reduce((sum, i) => sum + Number(i.balance), 0);

    const totalOwes = items
      .filter((i) => Number(i.balance) < 0)
      .reduce((sum, i) => sum + Math.abs(Number(i.balance)), 0);

    return {
      workers: items,
      totals: {
        totalWorkers: items.length,
        totalOwed,
        totalOwes,
        netBalance: totalOwed - totalOwes,
      },
    };
  }

  /**
   * Detailed ledger for a single worker.
   */
  async getWorkerLedger(params: {
    workspaceId: string;
    workerId: string;
  }) {
    const { workspaceId, workerId } = params;

    const worker = await workerRepository.findById({ workspaceId, id: workerId });
    if (!worker) return null;

    const transactions = await transactionRepository.findByWorker({
      workspaceId,
      workerId,
    });

    // Compute running balance chronologically
    let balance = new Prisma.Decimal(worker.openingBalance);
    const openingBalance = balance.toString();

    const entries = transactions.map((tx) => {
      const amt = new Prisma.Decimal(tx.amount);
      const before = balance.toString();

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
        id: tx.id,
        type: tx.type,
        reason: tx.reason,
        workName: tx.workName,
        rate: tx.rate?.toString() ?? null,
        pieces: tx.pieces,
        amount: tx.amount.toString(),
        paymentMethod: tx.paymentMethod,
        remarks: tx.remarks,
        date: tx.date.toISOString(),
        balanceBefore: before,
        balanceAfter: balance.toString(),
      };
    });

    return {
      worker: {
        id: worker.id,
        name: worker.name,
        photo: worker.photo,
        mobile: worker.mobile,
        address: worker.address,
        openingBalance,
        createdAt: worker.createdAt.toISOString(),
      },
      entries,
      finalBalance: balance.toString(),
    };
  }
}

export const ledgerService = new LedgerService();