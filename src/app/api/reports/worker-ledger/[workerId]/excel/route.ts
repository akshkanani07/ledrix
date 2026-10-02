import { NextRequest, NextResponse } from "next/server";

import { getServerSession } from "@/lib/session";
import { workspaceService } from "@/features/workspace/services/workspace.service";
import { reportService } from "@/features/reports/services/report.service";
import { generateWorkerLedgerExcel } from "@/features/reports/generators/excel.generator";

/**
 * Ledrix — Worker Ledger Excel download endpoint.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ workerId: string }> }
) {
  try {
    const { workerId } = await params;

    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const workspace = await workspaceService.getPrimaryForUser(
      session.user.id
    );
    if (!workspace) {
      return NextResponse.json(
        { error: "Workspace not found" },
        { status: 404 }
      );
    }

    const report = await reportService.getWorkerLedgerReport({
      workspaceId: workspace.id,
      workerId,
    });

    if (!report) {
      return NextResponse.json(
        { error: "Worker not found" },
        { status: 404 }
      );
    }

    const buffer = await generateWorkerLedgerExcel(report);
    const filename = `ledger-${report.worker.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")}-${new Date()
      .toISOString()
      .slice(0, 10)}.xlsx`;

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": String(buffer.length),
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("[excel-download]", error);
    return NextResponse.json(
      { error: "Failed to generate Excel" },
      { status: 500 }
    );
  }
}