import { prisma } from "@/lib/prisma";
import type { Prisma, WorkerStatus } from "@prisma/client";
import type { WorkerFilters } from "../types/worker.types";

export interface CreateWorkerData {
  name: string;
  mobile?: string | null;
  address?: string | null;
  notes?: string | null;
  photo?: string | null;
  openingBalance?: number;
  status?: WorkerStatus;
}

export interface UpdateWorkerData {
  name?: string;
  mobile?: string | null;
  address?: string | null;
  notes?: string | null;
  photo?: string | null;
  openingBalance?: number;
  status?: WorkerStatus;
}

export class WorkerRepository {
  async create(params: { workspaceId: string; data: CreateWorkerData }) {
    const { workspaceId, data } = params;
    return prisma.worker.create({
      data: {
        workspaceId,
        name: data.name,
        mobile: data.mobile || null,
        address: data.address || null,
        notes: data.notes || null,
        photo: data.photo || null,
        openingBalance: data.openingBalance ?? 0,
        status: data.status ?? "ACTIVE",
      },
    });
  }

  async findById(params: { workspaceId: string; id: string }) {
    return prisma.worker.findFirst({
      where: {
        id: params.id,
        workspaceId: params.workspaceId,
        deletedAt: null,
      },
    });
  }

  async findMany(params: {
    workspaceId: string;
    filters?: WorkerFilters;
    skip?: number;
    take?: number;
  }) {
    const { workspaceId, filters, skip = 0, take = 20 } = params;

    const where: Prisma.WorkerWhereInput = {
      workspaceId,
      deletedAt: null,
    };

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { mobile: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    if (filters?.status && filters.status !== "ALL") {
      where.status = filters.status;
    }

    // ✅ Step 1: Fetch workers (no relations)
    const [items, total] = await Promise.all([
      prisma.worker.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
      }),
      prisma.worker.count({ where }),
    ]);

    if (items.length === 0) {
      return { items: [], total };
    }

    const workerIds = items.map((w) => w.id);

    // ✅ Step 2: Parallel aggregate queries
    const [counts, credits, debits] = await Promise.all([
      // Count of active transactions per worker
      prisma.transaction.groupBy({
        by: ["workerId"],
        where: {
          workspaceId,
          workerId: { in: workerIds },
          deletedAt: null,
        },
        _count: { _all: true },
      }),

      // Sum of WORK + DEDUCTION (credits to worker)
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

      // Sum of PAYMENT + ADVANCE (debits)
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

    // ✅ Step 3: Build lookup maps
    const countMap = new Map<string, number>(
      counts.map((c) => [c.workerId, c._count._all])
    );
    const creditMap = new Map<string, number>(
      credits.map((c) => [c.workerId, Number(c._sum.amount ?? 0)])
    );
    const debitMap = new Map<string, number>(
      debits.map((c) => [c.workerId, Number(c._sum.amount ?? 0)])
    );

    // ✅ Step 4: Enrich items with count + running balance
    const enriched = items.map((w) => {
      const opening = Number(w.openingBalance);
      const credit = creditMap.get(w.id) ?? 0;
      const debit = debitMap.get(w.id) ?? 0;
      const runningBalance = opening + credit - debit;

      return {
        ...w,
        _count: { transactions: countMap.get(w.id) ?? 0 },
        runningBalance,
      };
    });

    return { items: enriched, total };
  }

  async update(params: {
    workspaceId: string;
    id: string;
    data: UpdateWorkerData;
  }) {
    const existing = await this.findById({
      workspaceId: params.workspaceId,
      id: params.id,
    });
    if (!existing) return null;

    const data = params.data;
    return prisma.worker.update({
      where: { id: params.id },
      data: {
        name: data.name,
        mobile: data.mobile !== undefined ? data.mobile || null : undefined,
        address: data.address !== undefined ? data.address || null : undefined,
        notes: data.notes !== undefined ? data.notes || null : undefined,
        photo: data.photo !== undefined ? data.photo || null : undefined,
        openingBalance: data.openingBalance,
        status: data.status,
      },
    });
  }

  async softDelete(params: { workspaceId: string; id: string }) {
    const existing = await this.findById({
      workspaceId: params.workspaceId,
      id: params.id,
    });
    if (!existing) return null;

    return prisma.worker.update({
      where: { id: params.id },
      data: { deletedAt: new Date() },
    });
  }

  async countByStatus(workspaceId: string) {
    const [active, inactive, archived] = await Promise.all([
      prisma.worker.count({
        where: { workspaceId, status: "ACTIVE", deletedAt: null },
      }),
      prisma.worker.count({
        where: { workspaceId, status: "INACTIVE", deletedAt: null },
      }),
      prisma.worker.count({
        where: { workspaceId, status: "ARCHIVED", deletedAt: null },
      }),
    ]);
    return { active, inactive, archived, total: active + inactive + archived };
  }
}

export const workerRepository = new WorkerRepository();