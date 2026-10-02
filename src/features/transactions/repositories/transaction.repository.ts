import { prisma } from "@/lib/prisma";
import type { Prisma, TransactionType, PaymentMethod } from "@prisma/client";
import type { TransactionFilters } from "../types/transaction.types";

export interface CreateTransactionData {
  workerId: string;
  type: TransactionType;
  reason: string;
  workName?: string | null;
  rate?: number | null;
  pieces?: number | null;
  amount: number;
  paymentMethod?: PaymentMethod | null;
  remarks?: string | null;
  date: Date;
}

export class TransactionRepository {
  // ═══════════════════════════════════════════════════════════
  // CREATE
  // ═══════════════════════════════════════════════════════════

  async create(params: { workspaceId: string; data: CreateTransactionData }) {
    const { workspaceId, data } = params;
    return prisma.transaction.create({
      data: {
        workspaceId,
        workerId: data.workerId,
        type: data.type,
        reason: data.reason,
        workName: data.workName || null,
        rate: data.rate ?? null,
        pieces: data.pieces ?? null,
        amount: data.amount,
        paymentMethod: data.paymentMethod || null,
        remarks: data.remarks || null,
        date: data.date,
      },
      include: {
        worker: { select: { name: true } },
      },
    });
  }

  // ═══════════════════════════════════════════════════════════
  // READ
  // ═══════════════════════════════════════════════════════════

  async findById(params: { workspaceId: string; id: string }) {
    return prisma.transaction.findFirst({
      where: {
        id: params.id,
        workspaceId: params.workspaceId,
        deletedAt: null,
      },
      include: { worker: { select: { name: true } } },
    });
  }

  async findMany(params: {
    workspaceId: string;
    filters?: TransactionFilters;
    skip?: number;
    take?: number;
  }) {
    const { workspaceId, filters, skip = 0, take = 20 } = params;

    const where: Prisma.TransactionWhereInput = {
      workspaceId,
      deletedAt: null,
    };

    if (filters?.workerId) where.workerId = filters.workerId;
    if (filters?.type && filters.type !== "ALL") where.type = filters.type;

    if (filters?.fromDate || filters?.toDate) {
      where.date = {};
      if (filters.fromDate) where.date.gte = new Date(filters.fromDate);
      if (filters.toDate) where.date.lte = new Date(filters.toDate);
    }

    if (filters?.search) {
      where.OR = [
        { reason: { contains: filters.search, mode: "insensitive" } },
        { workName: { contains: filters.search, mode: "insensitive" } },
        { worker: { name: { contains: filters.search, mode: "insensitive" } } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        skip,
        take,
        orderBy: [{ date: "desc" }, { createdAt: "desc" }],
        include: { worker: { select: { name: true } } },
      }),
      prisma.transaction.count({ where }),
    ]);

    return { items, total };
  }

  async findByWorker(params: { workspaceId: string; workerId: string }) {
    // ✅ No `worker` include — caller already has worker context
    return prisma.transaction.findMany({
      where: {
        workspaceId: params.workspaceId,
        workerId: params.workerId,
        deletedAt: null,
      },
      orderBy: [{ date: "asc" }, { createdAt: "asc" }],
    });
  }

  // ═══════════════════════════════════════════════════════════
  // UPDATE
  // ═══════════════════════════════════════════════════════════

  async update(params: {
    workspaceId: string;
    id: string;
    data: CreateTransactionData;
  }) {
    // Tenant guard
    const existing = await this.findById({
      workspaceId: params.workspaceId,
      id: params.id,
    });
    if (!existing) return null;

    const d = params.data;
    return prisma.transaction.update({
      where: { id: params.id },
      data: {
        workerId: d.workerId,
        type: d.type,
        reason: d.reason,
        workName: d.workName || null,
        rate: d.rate ?? null,
        pieces: d.pieces ?? null,
        amount: d.amount,
        paymentMethod: d.paymentMethod || null,
        remarks: d.remarks || null,
        date: d.date,
      },
      include: { worker: { select: { name: true } } },
    });
  }

  // ═══════════════════════════════════════════════════════════
  // DELETE (soft)
  // ═══════════════════════════════════════════════════════════

  async softDelete(params: { workspaceId: string; id: string }) {
    const existing = await this.findById({
      workspaceId: params.workspaceId,
      id: params.id,
    });
    if (!existing) return null;

    return prisma.transaction.update({
      where: { id: params.id },
      data: { deletedAt: new Date() },
    });
  }

  // ═══════════════════════════════════════════════════════════
  // AGGREGATIONS
  // ═══════════════════════════════════════════════════════════

  async sumByType(params: { workspaceId: string; workerId: string }) {
    const groups = await prisma.transaction.groupBy({
      by: ["type"],
      where: {
        workspaceId: params.workspaceId,
        workerId: params.workerId,
        deletedAt: null,
      },
      _sum: { amount: true },
    });

    const result: Record<TransactionType, number> = {
      WORK: 0,
      PAYMENT: 0,
      ADVANCE: 0,
      DEDUCTION: 0,
    };

    for (const g of groups) {
      result[g.type] = Number(g._sum.amount ?? 0);
    }

    return result;
  }

  async todayTotals(workspaceId: string) {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
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

    return result;
  }
}

export const transactionRepository = new TransactionRepository();