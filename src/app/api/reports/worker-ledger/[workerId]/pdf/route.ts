import { NextRequest, NextResponse } from "next/server";

import { getServerSession } from "@/lib/session";
import { workspaceService } from "@/features/workspace/services/workspace.service";
import { reportService } from "@/features/reports/services/report.service";
import { generateWorkerLedgerPDF } from "@/features/reports/generators/pdf.generator";

export async function HEAD() {
  return new Response(null, { status: 200 });
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ workerId: string }> }
) {
  const startTime = Date.now();
  console.log("[PDF] === START ===");

  try {
    const { workerId } = await params;
    console.log("[PDF] workerId:", workerId);

    const session = await getServerSession();
    console.log("[PDF] session:", !!session);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const workspace = await workspaceService.getPrimaryForUser(
      session.user.id
    );
    console.log("[PDF] workspace:", !!workspace);

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
    console.log("[PDF] report:", !!report, "entries:", report?.entries.length);

    if (!report) {
      return NextResponse.json(
        { error: "Worker not found" },
        { status: 404 }
      );
    }

    console.log("[PDF] generating PDF...");
    const pdfBuffer = await generateWorkerLedgerPDF(report);
    console.log(
      "[PDF] PDF generated. Size:",
      pdfBuffer.length,
      "bytes. Time:",
      Date.now() - startTime,
      "ms"
    );

    const filename = `ledger-${report.worker.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")}-${new Date()
      .toISOString()
      .slice(0, 10)}.pdf`;

    const uint8Array = new Uint8Array(pdfBuffer);

    console.log("[PDF] === DONE ===");
    return new Response(uint8Array, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": String(uint8Array.length),
      },
    });
  } catch (error) {
    console.error("[PDF] ERROR:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}