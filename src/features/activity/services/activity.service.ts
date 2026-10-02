import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

export interface LogActivityParams {
  workspaceId: string;
  userId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  metadata?: Record<string, unknown>;
  ipAddress?: string | null;
  userAgent?: string | null;
}

/**
 * Ledrix — Activity Service.
 * Audit trail for workspace actions.
 */
export class ActivityService {
  async log(params: LogActivityParams) {
    try {
      await prisma.activityLog.create({
        data: {
          workspaceId: params.workspaceId,
          userId: params.userId ?? null,
          action: params.action,
          entityType: params.entityType,
          entityId: params.entityId ?? null,
          metadata: params.metadata
            ? (params.metadata as object)
            : undefined,
          ipAddress: params.ipAddress ?? null,
          userAgent: params.userAgent ?? null,
        },
      });
    } catch (error) {
      logger.error("Activity log failed", { error, ...params });
    }
  }

  async list(params: {
    workspaceId: string;
    filters?: { action?: string; entityType?: string; search?: string };
    skip?: number;
    take?: number;
  }) {
    const { workspaceId, filters, skip = 0, take = 50 } = params;

    const where: {
      workspaceId: string;
      action?: string;
      entityType?: string;
      OR?: Array<Record<string, unknown>>;
    } = { workspaceId };

    if (filters?.action) where.action = filters.action;
    if (filters?.entityType) where.entityType = filters.entityType;
    if (filters?.search) {
      where.OR = [
        { action: { contains: filters.search, mode: "insensitive" } },
        { entityType: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.activityLog.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
      }),
      prisma.activityLog.count({ where }),
    ]);

    return { items, total };
  }
}

export const activityService = new ActivityService();