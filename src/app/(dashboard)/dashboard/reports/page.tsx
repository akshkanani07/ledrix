import type { Metadata } from "next";
import Link from "next/link";
import {
  BarChart3,
  Users,
  FileText,
  Download,
  ArrowUpRight,
} from "lucide-react";

import { requireWorkspace } from "@/features/workspace/services/session-workspace";
import { reportService } from "@/features/reports/services/report.service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/config/routes";

export const metadata: Metadata = {
  title: "Reports",
  description: "Generate ledger reports",
};

export default async function ReportsPage() {
  const workspace = await requireWorkspace();
  const report = await reportService.getAllWorkersReport(workspace.id);

  if (!report) {
    return null;
  }

  const totals = report.totals;

  return (
    <div className="space-y-6">
      {/* ─── Header ─────────────────────────────────── */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight lg:text-3xl">
            Reports
          </h1>
          <p className="text-sm text-muted-foreground">
            Generate and share worker ledger reports
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="h-9"
          disabled
          title="Full workspace report — coming soon"
        >
          <Download className="mr-1.5 size-4" />
          Export All
        </Button>
      </div>

      {/* ─── Summary cards ──────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-5">
            <div className="rounded-lg bg-blue-50 p-2.5">
              <Users className="size-4 text-blue-600" />
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Total Workers
              </p>
              <p className="text-xl font-semibold">{totals.totalWorkers}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3 p-5">
            <div className="rounded-lg bg-emerald-50 p-2.5">
              <ArrowUpRight className="size-4 text-emerald-600" />
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Total Credit
              </p>
              <p className="text-xl font-semibold">
                {formatMoney(totals.totalCredit)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3 p-5">
            <div className="rounded-lg bg-amber-50 p-2.5">
              <ArrowUpRight className="size-4 rotate-180 text-amber-600" />
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Total Debit
              </p>
              <p className="text-xl font-semibold">
                {formatMoney(totals.totalDebit)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3 p-5">
            <div className="rounded-lg bg-zinc-100 p-2.5">
              <BarChart3 className="size-4 text-zinc-700" />
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Net Balance
              </p>
              <p
                className={cn(
                  "text-xl font-semibold",
                  totals.totalBalance > 0 && "text-emerald-600",
                  totals.totalBalance < 0 && "text-blue-600"
                )}
              >
                {formatMoney(Math.abs(totals.totalBalance))}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ─── Worker reports list ──────────────────────── */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b pb-4">
          <div>
            <CardTitle className="text-sm font-semibold">
              Worker Ledger Reports
            </CardTitle>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Download PDF, Excel, or share via WhatsApp
            </p>
          </div>
        </CardHeader>

        {report.workers.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-muted">
              <FileText className="size-6 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-base font-semibold">
              No reports available
            </h3>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Add workers and record transactions to generate ledger reports.
            </p>
            <Button asChild size="sm" className="mt-6">
              <Link href={ROUTES.workerNew}>Add Worker</Link>
            </Button>
          </div>
        ) : (
          <div className="divide-y">
            {report.workers.map((worker) => {
              const balance = Number(worker.balance);
              const isOwed = balance > 0;
              const owes = balance < 0;

              return (
                <Link
                  key={worker.id}
                  href={`/dashboard/reports/${worker.id}`}
                  className="group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-muted/50"
                >
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-xs font-medium text-white">
                    {worker.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-medium">
                        {worker.name}
                      </p>
                      <Badge
                        variant="outline"
                        className={cn(
                          "shrink-0 text-[10px]",
                          worker.status === "ACTIVE" &&
                            "bg-emerald-50 text-emerald-700 border-emerald-200",
                          worker.status === "INACTIVE" &&
                            "bg-amber-50 text-amber-700 border-amber-200",
                          worker.status === "ARCHIVED" &&
                            "bg-zinc-100 text-zinc-700 border-zinc-200"
                        )}
                      >
                        {worker.status.toLowerCase()}
                      </Badge>
                    </div>
                    {worker.mobile && (
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {worker.mobile}
                      </p>
                    )}
                  </div>

                  <div className="hidden items-center gap-6 text-right sm:flex">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        Credit
                      </p>
                      <p className="text-sm font-medium text-emerald-600">
                        {formatMoney(worker.totalCredit)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        Debit
                      </p>
                      <p className="text-sm font-medium text-blue-600">
                        {formatMoney(worker.totalDebit)}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <p
                      className={cn(
                        "text-sm font-semibold",
                        isOwed && "text-emerald-600",
                        owes && "text-blue-600",
                        !isOwed && !owes && "text-muted-foreground"
                      )}
                    >
                      {formatMoney(Math.abs(balance))}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {isOwed ? "You owe" : owes ? "Owes you" : "Settled"}
                    </p>
                  </div>

                  <ArrowUpRight className="size-4 shrink-0 text-muted-foreground/40 opacity-0 transition-opacity group-hover:opacity-100" />
                </Link>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}