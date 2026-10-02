import { prisma } from "@/lib/prisma";
import { workerRepository } from "@/features/workers/repositories/worker.repository";
import { transactionRepository } from "@/features/transactions/repositories/transaction.repository";

/**
 * Ledrix — Dashboard Service.
 * Aggregates real data for the dashboard overview.
 */
export class DashboardService {
  async getStats(workspaceId: string) {
    const [workerStats, todayTotals] = await Promise.all([
      workerRepository.countByStatus(workspaceId),
      transactionRepository.todayTotals(workspaceId),
    ]);

    // Outstanding balance = sum(all running balances)
    const outstanding = await this.getOutstandingBalance(workspaceId);

    return {
      totalWorkers: workerStats.total,
      activeWorkers: workerStats.active,
      todayWork: todayTotals.WORK.sum,
      todayWorkCount: todayTotals.WORK.count,
      todayPayments:
        todayTotals.PAYMENT.sum + todayTotals.ADVANCE.sum,
      todayPaymentsCount:
        todayTotals.PAYMENT.count + todayTotals.ADVANCE.count,
      todayDeductions: todayTotals.DEDUCTION.sum,
      outstandingBalance: outstanding,
    };
  }

  async getOutstandingBalance(workspaceId: string) {
    const workers = await prisma.worker.findMany({
      where: { workspaceId, deletedAt: null },
      select: { id: true, openingBalance: true },
    });

    if (workers.length === 0) {
      return { owed: 0, owes: 0, net: 0 };
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

    let owed = 0;  // You owe workers (positive balances)
    let owes = 0;  // Workers owe you (negative balances)

    for (const w of workers) {
      const opening = Number(w.openingBalance);
      const credit = creditMap.get(w.id) ?? 0;
      const debit = debitMap.get(w.id) ?? 0;
      const balance = opening + credit - debit;

      if (balance > 0) owed += balance;
      else if (balance < 0) owes += Math.abs(balance);
    }

    return { owed, owes, net: owed - owes };
  }

  /**
   * Recent transactions for dashboard feed.
   */
  async getRecentActivity(workspaceId: string, limit = 5) {
    const { items } = await transactionRepository.findMany({
      workspaceId,
      skip: 0,
      take: limit,
    });

    return items.map((tx) => ({
      id: tx.id,
      workerId: tx.workerId,
      workerName: tx.worker.name,
      type: tx.type,
      reason: tx.reason,
      workName: tx.workName,
      amount: tx.amount.toString(),
      date: tx.date.toISOString(),
    }));
  }

  /**
   * Monthly summary (current month).
   */
  async getMonthlySummary(workspaceId: string) {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const groups = await prisma.transaction.groupBy({
      by: ["type"],
      where: {
        workspaceId,
        deletedAt: null,
        date: { gte: start, lte: end },
      },
      _sum: { amount: true },
      _count: true,
    });

    const result = {
      WORK: { sum: 0, count: 0 },
      PAYMENT: { sum: 0, count: 0 },
      ADVANCE: { sum: 0, count: 0 },
      DEDUCTION: { sum: 0, count: 0 },
    };

    for (const g of groups) {
      result[g.type] = {
        sum: Number(g._sum.amount ?? 0),
        count: g._count,
      };
    }

    return {
      work: result.WORK,
      payments: {
        sum: result.PAYMENT.sum + result.ADVANCE.sum,
        count: result.PAYMENT.count + result.ADVANCE.count,
      },
      deductions: result.DEDUCTION,
    };
  }
}

export const dashboardService = new DashboardService();