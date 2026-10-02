import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, FileText } from "lucide-react";

import { requireWorkspace } from "@/features/workspace/services/session-workspace";
import { workerService } from "@/features/workers/services/worker.service";
import { ReportActions } from "@/features/reports/components/report-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/utils";

interface ReportDetailPageProps {
  params: Promise<{ workerId: string }>;
}

export async function generateMetadata({
  params,
}: ReportDetailPageProps): Promise<Metadata> {
  const { workerId } = await params;
  const workspace = await requireWorkspace();
  const worker = await workerService.getById({
    workspaceId: workspace.id,
    id: workerId,
  });

  return {
    title: worker ? `Report · ${worker.name}` : "Report",
  };
}

export default async function ReportDetailPage({
  params,
}: ReportDetailPageProps) {
  const { workerId } = await params;
  const workspace = await requireWorkspace();

  const worker = await workerService.getById({
    workspaceId: workspace.id,
    id: workerId,
  });

  if (!worker) notFound();

  const balance = Number(worker.openingBalance);
  const isOwed = balance > 0;
  const owes = balance < 0;

  return (
    <div className="space-y-6">
      {/* ─── Back ─────────────────────────────────────── */}
      <Button asChild variant="ghost" size="sm" className="-ml-2 h-8">
        <Link href="/dashboard/reports">
          <ArrowLeft className="mr-1.5 size-4" />
          Back to Reports
        </Link>
      </Button>

      {/* ─── Header ───────────────────────────────────── */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Report for
          </p>
          <h1 className="text-2xl font-semibold tracking-tight lg:text-3xl">
            {worker.name}
          </h1>
          {worker.mobile && (
            <p className="text-sm text-muted-foreground">{worker.mobile}</p>
          )}
        </div>

        <ReportActions
          workerId={worker.id}
          workerName={worker.name}
          workerMobile={worker.mobile}
        />
      </div>

      {/* ─── Info card ────────────────────────────────── */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Opening Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-semibold">
              {formatMoney(worker.openingBalance)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Current Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p
              className={cn(
                "text-xl font-semibold",
                isOwed && "text-emerald-600",
                owes && "text-blue-600"
              )}
            >
              {formatMoney(Math.abs(balance))}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {isOwed ? "You owe worker" : owes ? "Worker owes you" : "Settled"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge
              variant="outline"
              className={cn(
                worker.status === "ACTIVE" &&
                  "bg-emerald-50 text-emerald-700 border-emerald-200",
                worker.status === "INACTIVE" &&
                  "bg-amber-50 text-amber-700 border-amber-200",
                worker.status === "ARCHIVED" &&
                  "bg-zinc-100 text-zinc-700 border-zinc-200"
              )}
            >
              {worker.status.charAt(0) +
                worker.status.slice(1).toLowerCase()}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* ─── Actions info card ────────────────────────── */}
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center px-6 py-12 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-muted">
            <FileText className="size-5 text-muted-foreground" />
          </div>
          <h3 className="mt-3 text-base font-semibold">
            Export options available above
          </h3>
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
            Generate a PDF, download as Excel, or share the ledger summary
            directly on WhatsApp.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}