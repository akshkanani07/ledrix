import { prisma } from "@/lib/prisma";

/**
 * Ledrix — Analytics Service.
 * Business insights + trends.
 */
export class AnalyticsService {
  /**
   * Overview stats.
   */
  async getOverview(workspaceId: string) {
    const [workers, totalTxns, allTimeTotals] = await Promise.all([
      prisma.worker.findMany({
        where: { workspaceId, deletedAt: null },
        select: { id: true, name: true, openingBalance: true },
      }),
      prisma.transaction.count({
        where: { workspaceId, deletedAt: null },
      }),
      prisma.transaction.groupBy({
        by: ["type"],
        where: { workspaceId, deletedAt: null },
        _sum: { amount: true },
      }),
    ]);

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

    let totalOwed = 0; // You owe workers
    let totalOwes = 0; // Workers owe you
    let totalOwedWorkers = 0;
    let totalOwesWorkers = 0;

    for (const w of workers) {
      const opening = Number(w.openingBalance);
      const credit = creditMap.get(w.id) ?? 0;
      const debit = debitMap.get(w.id) ?? 0;
      const balance = opening + credit - debit;

      if (balance > 0) {
        totalOwed += balance;
        totalOwedWorkers++;
      } else if (balance < 0) {
        totalOwes += Math.abs(balance);
        totalOwesWorkers++;
      }
    }

    const allTimeWork =
      allTimeTotals.find((t) => t.type === "WORK")?._sum.amount ?? 0;
    const allTimePayment =
      allTimeTotals.find((t) => t.type === "PAYMENT")?._sum.amount ?? 0;
    const allTimeAdvance =
      allTimeTotals.find((t) => t.type === "ADVANCE")?._sum.amount ?? 0;
    const allTimeDeduction =
      allTimeTotals.find((t) => t.type === "DEDUCTION")?._sum.amount ?? 0;

    return {
      totalWorkers: workers.length,
      activeWorkers: workers.length,
      totalTransactions: totalTxns,
      totalOwed: totalOwed,
      totalOwes: totalOwes,
      totalOwedWorkers,
      totalOwesWorkers,
      netBalance: totalOwed - totalOwes,
      allTimeWork: Number(allTimeWork),
      allTimePayment: Number(allTimePayment),
      allTimeAdvance: Number(allTimeAdvance),
      allTimeDeduction: Number(allTimeDeduction),
    };
  }

  /**
   * Monthly trend — last N months.
   */
  async getMonthlyTrend(workspaceId: string, months = 6) {
    const result: Array<{
      month: string;
      label: string;
      work: number;
      payment: number;
      advance: number;
      deduction: number;
      net: number;
    }> = [];

    const now = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(
        now.getFullYear(),
        now.getMonth() - i + 1,
        0,
        23,
        59,
        59
      );

      const groups = await prisma.transaction.groupBy({
        by: ["type"],
        where: {
          workspaceId,
          deletedAt: null,
          date: { gte: start, lte: end },
        },
        _sum: { amount: true },
      });

      const get = (type: string) =>
        Number(groups.find((g) => g.type === type)?._sum.amount ?? 0);

      const work = get("WORK");
      const payment = get("PAYMENT");
      const advance = get("ADVANCE");
      const deduction = get("DEDUCTION");

      result.push({
        month: `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}`,
        label: start.toLocaleDateString("en-IN", { month: "short" }),
        work,
        payment,
        advance,
        deduction,
        net: work + deduction - payment - advance,
      });
    }

    return result;
  }

  /**
   * Top workers by balance.
   */
  async getTopWorkers(workspaceId: string, limit = 5) {
    const workers = await prisma.worker.findMany({
      where: { workspaceId, deletedAt: null },
      select: { id: true, name: true, mobile: true, openingBalance: true },
    });

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

    const items = workers
      .map((w) => {
        const opening = Number(w.openingBalance);
        const credit = creditMap.get(w.id) ?? 0;
        const debit = debitMap.get(w.id) ?? 0;
        const balance = opening + credit - debit;

        return {
          id: w.id,
          name: w.name,
          mobile: w.mobile,
          balance,
          credit,
          debit,
        };
      })
      .filter((w) => w.balance !== 0)
      .sort((a, b) => Math.abs(b.balance) - Math.abs(a.balance))
      .slice(0, limit);

    return items;
  }

  /**
   * Weekly activity (last 7 days).
   */
  async getWeeklyActivity(workspaceId: string) {
    const result: Array<{
      day: string;
      label: string;
      count: number;
      work: number;
      payment: number;
    }> = [];

    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const day = new Date(now);
      day.setDate(now.getDate() - i);
      const start = new Date(day);
      start.setHours(0, 0, 0, 0);
      const end = new Date(day);
      end.setHours(23, 59, 59, 999);

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

      const get = (type: string) => ({
        sum: Number(groups.find((g) => g.type === type)?._sum.amount ?? 0),
        count: groups.find((g) => g.type === type)?._count ?? 0,
      });

      const work = get("WORK");
      const payment = get("PAYMENT");
      const advance = get("ADVANCE");
      const deduction = get("DEDUCTION");

      result.push({
        day: start.toISOString().slice(0, 10),
        label: start.toLocaleDateString("en-IN", { weekday: "short" }),
        count: work.count + payment.count + advance.count + deduction.count,
        work: work.sum,
        payment: payment.sum + advance.sum,
      });
    }

    return result;
  }
}

export const analyticsService = new AnalyticsService();