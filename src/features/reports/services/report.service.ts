import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { workspaceRepository } from "@/features/workspace/repositories/workspace.repository";
import { workerRepository } from "@/features/workers/repositories/worker.repository";
import { transactionRepository } from "@/features/transactions/repositories/transaction.repository";
import type {
  WorkerLedgerReport,
  LedgerReportEntry,
} from "../types/report.types";

import { cache } from "@/lib/cache";

/**
 * Ledrix — Report Service.
 * Aggregates data for PDF/Excel/WhatsApp exports.
 */
export class ReportService {
  /**
   * Worker ledger report — full running ledger for one worker.
   */
  async getWorkerLedgerReport(params: {
    workspaceId: string;
    workerId: string;
    fromDate?: Date;
    toDate?: Date;
  }): Promise<WorkerLedgerReport | null> {
    const { workspaceId, workerId } = params;

    // ✅ Cache 60s — same report rapid re-requests
    const cacheKey = `ledger:${workspaceId}:${workerId}`;
    const cached = await cache.get<WorkerLedgerReport>(cacheKey);
    if (cached) return cached;

    const [workspace, worker, transactions] = await Promise.all([
      prisma.workspace.findUnique({ where: { id: workspaceId } }),
      workerRepository.findById({ workspaceId, id: workerId }),
      transactionRepository.findByWorker({
        workspaceId,
        workerId,
      }),
    ]);

    if (!workspace || !worker) return null;

    // Compute running balance
    let balance = new Prisma.Decimal(worker.openingBalance);
    let totalCredit = 0;
    let totalDebit = 0;

    const entries: LedgerReportEntry[] = transactions.map((tx) => {
      const amt = new Prisma.Decimal(tx.amount);
      const isCredit = tx.type === "WORK" || tx.type === "DEDUCTION";

      if (isCredit) {
        balance = balance.add(amt);
        totalCredit += Number(amt);
      } else {
        balance = balance.sub(amt);
        totalDebit += Number(amt);
      }

      return {
        date: tx.date.toISOString(),
        type: tx.type,
        reason: tx.reason,
        workName: tx.workName,
        rate: tx.rate?.toString() ?? null,
        pieces: tx.pieces,
        amount: tx.amount.toString(),
        paymentMethod: tx.paymentMethod,
        remarks: tx.remarks,
        credit: isCredit ? tx.amount.toString() : "0",
        debit: !isCredit ? tx.amount.toString() : "0",
        balance: balance.toString(),
      };
    });

    const firstTx = transactions[0];
    const lastTx = transactions[transactions.length - 1];

    const report: WorkerLedgerReport = {
      workspace: {
        name: workspace.name,
        currency: workspace.currency,
      },
      worker: {
        name: worker.name,
        mobile: worker.mobile,
        address: worker.address,
        openingBalance: worker.openingBalance.toString(),
      },
      entries,
      totals: {
        credit: totalCredit,
        debit: totalDebit,
        finalBalance: Number(balance),
      },
      generatedAt: new Date().toISOString(),
      period: {
        from: firstTx?.date.toISOString() ?? new Date().toISOString(),
        to: lastTx?.date.toISOString() ?? new Date().toISOString(),
      },
    };

    // Cache 60 seconds
    await cache.set(cacheKey, report, 60);
    return report;
  }

  /**
   * All workers summary.
   */
  async getAllWorkersReport(workspaceId: string) {
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
    });
    if (!workspace) return null;

    const workers = await prisma.worker.findMany({
      where: { workspaceId, deletedAt: null },
      orderBy: { name: "asc" },
    });

    if (workers.length === 0) {
      return {
        workspace: { name: workspace.name, currency: workspace.currency },
        workers: [],
        totals: {
          totalWorkers: 0,
          totalCredit: 0,
          totalDebit: 0,
          totalBalance: 0,
        },
        generatedAt: new Date().toISOString(),
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

    let totalCredit = 0;
    let totalDebit = 0;
    let totalBalance = 0;

    const items = workers.map((w) => {
      const opening = Number(w.openingBalance);
      const credit = creditMap.get(w.id) ?? 0;
      const debit = debitMap.get(w.id) ?? 0;
      const balance = opening + credit - debit;

      totalCredit += credit;
      totalDebit += debit;
      totalBalance += balance;

      return {
        id: w.id,
        name: w.name,
        mobile: w.mobile,
        status: w.status,
        openingBalance: opening.toFixed(2),
        totalCredit: credit.toFixed(2),
        totalDebit: debit.toFixed(2),
        balance: balance.toFixed(2),
      };
    });

    return {
      workspace: { name: workspace.name, currency: workspace.currency },
      workers: items,
      totals: {
        totalWorkers: items.length,
        totalCredit,
        totalDebit,
        totalBalance,
      },
      generatedAt: new Date().toISOString(),
    };
  }
}

export const reportService = new ReportService();