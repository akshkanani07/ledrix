import { NextRequest, NextResponse } from "next/server";

import { getServerSession } from "@/lib/session";
import { workspaceService } from "@/features/workspace/services/workspace.service";
import { prisma } from "@/lib/prisma";

/**
 * Ledrix — Global Search API.
 * GET /api/search?q=query
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const workspace = await workspaceService.getPrimaryForUser(
      session.user.id
    );
    if (!workspace) {
      return NextResponse.json({ results: [] });
    }

    const query = req.nextUrl.searchParams.get("q")?.trim() ?? "";
    if (query.length < 2) {
      return NextResponse.json({ results: [] });
    }

    const [workers, transactions] = await Promise.all([
      prisma.worker.findMany({
        where: {
          workspaceId: workspace.id,
          deletedAt: null,
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { mobile: { contains: query, mode: "insensitive" } },
          ],
        },
        take: 5,
        select: {
          id: true,
          name: true,
          mobile: true,
          photo: true,
        },
      }),
      prisma.transaction.findMany({
        where: {
          workspaceId: workspace.id,
          deletedAt: null,
          OR: [
            { reason: { contains: query, mode: "insensitive" } },
            { workName: { contains: query, mode: "insensitive" } },
            { worker: { name: { contains: query, mode: "insensitive" } } },
          ],
        },
        take: 5,
        orderBy: { date: "desc" },
        include: {
          worker: { select: { name: true } },
        },
      }),
    ]);

    return NextResponse.json({
      results: {
        workers: workers.map((w) => ({
          id: w.id,
          name: w.name,
          mobile: w.mobile,
          photo: w.photo,
          type: "worker" as const,
        })),
        transactions: transactions.map((t) => ({
          id: t.id,
          workerName: t.worker.name,
          workerId: t.workerId,
          reason: t.reason,
          workName: t.workName,
          type: "transaction" as const,
        })),
      },
    });
  } catch (error) {
    console.error("[search]", error);
    return NextResponse.json({ results: [] }, { status: 500 });
  }
}