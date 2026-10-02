import { prisma } from "@/lib/prisma";
import type { UserRole } from "@prisma/client";

/**
 * Ledrix — Workspace Repository.
 * Multi-tenant: every query must scope to workspaceId.
 */
export class WorkspaceRepository {
  /**
   * Create workspace + add owner as member (atomic).
   */
  async createWithOwner(params: {
    name: string;
    slug: string;
    ownerId: string;
    role?: UserRole;
  }) {
    const { name, slug, ownerId, role = "OWNER" } = params;

    return prisma.workspace.create({
      data: {
        name,
        slug,
        members: {
          create: {
            userId: ownerId,
            role,
          },
        },
      },
      include: {
        members: {
          include: { user: true },
        },
      },
    });
  }

  async findByUserId(userId: string) {
    return prisma.workspace.findMany({
      where: {
        deletedAt: null,
        members: {
          some: { userId },
        },
      },
      include: {
        members: {
          where: { userId },
          select: { role: true },
        },
        _count: {
          select: { workers: true, transactions: true },
        },
      },
      orderBy: { createdAt: "asc" },
    });
  }

  async findBySlug(slug: string) {
    return prisma.workspace.findFirst({
      where: { slug, deletedAt: null },
      include: {
        members: {
          include: { user: true },
        },
      },
    });
  }

  async slugExists(slug: string): Promise<boolean> {
    const count = await prisma.workspace.count({
      where: { slug },
    });
    return count > 0;
  }

  async getPrimaryForUser(userId: string) {
    return prisma.workspace.findFirst({
      where: {
        deletedAt: null,
        members: { some: { userId } },
      },
      include: {
        members: {
          where: { userId },
          select: { role: true },
        },
      },
      orderBy: { createdAt: "asc" },
    });
  }
}

export const workspaceRepository = new WorkspaceRepository();