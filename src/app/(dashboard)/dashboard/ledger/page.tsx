import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, TrendingUp, TrendingDown, Users } from "lucide-react";

import { requireWorkspace } from "@/features/workspace/services/session-workspace";
import { ledgerService } from "@/features/ledger/services/ledger.service";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatMoney } from "@/lib/money";
import { ROUTES } from "@/config/routes";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Running Ledger",
  description: "All workers with running balances",
};

export default async function LedgerPage() {
  const workspace = await requireWorkspace();
  const { workers, totals } = await ledgerService.getOverview(workspace.id);

  return (
    <div className="space-y-6">
      {/* ─── Header ─────────────────────────────────── */}
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight lg:text-3xl">
          Running Ledger
        </h1>
        <p className="text-sm text-muted-foreground">
          All workers with their current running balance
        </p>
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

        <Card className="border-emerald-200 bg-emerald-50/50">
          <CardContent className="flex items-center gap-3 p-5">
            <div className="rounded-lg bg-emerald-100 p-2.5">
              <TrendingUp className="size-4 text-emerald-600" />
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                You Owe
              </p>
              <p className="text-xl font-semibold">
                {formatMoney(totals.totalOwed)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="flex items-center gap-3 p-5">
            <div className="rounded-lg bg-blue-100 p-2.5">
              <TrendingDown className="size-4 text-blue-600" />
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Workers Owe
              </p>
              <p className="text-xl font-semibold">
                {formatMoney(totals.totalOwes)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3 p-5">
            <div className="rounded-lg bg-zinc-100 p-2.5">
              <BookOpen className="size-4 text-zinc-700" />
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Net Balance
              </p>
              <p
                className={cn(
                  "text-xl font-semibold",
                  totals.netBalance > 0 && "text-emerald-600",
                  totals.netBalance < 0 && "text-blue-600"
                )}
              >
                {formatMoney(Math.abs(totals.netBalance))}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ─── Workers list ───────────────────────────── */}
      {workers.length === 0 ? (
        <Card className="border-dashed">
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-muted">
              <BookOpen className="size-6 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-base font-semibold">
              No workers to show
            </h3>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Add workers and record transactions to see their running ledger.
            </p>
            <Button asChild size="sm" className="mt-6">
              <Link href={ROUTES.workerNew}>Add Worker</Link>
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-2">
          {workers.map((worker) => {
            const balance = Number(worker.balance);
            const isOwed = balance > 0;
            const owes = balance < 0;

            return (
              <Link
                key={worker.id}
                href={`/dashboard/ledger/${worker.id}`}
                className="block rounded-xl border bg-card p-4 transition-all hover:border-zinc-300 hover:shadow-sm"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">
                      {worker.name}
                    </p>
                    {worker.mobile && (
                      <p className="truncate text-xs text-muted-foreground">
                        {worker.mobile}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-6 text-right">
                    <div className="hidden sm:block">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        Credit
                      </p>
                      <p className="text-sm font-medium text-emerald-600">
                        {formatMoney(worker.totalCredit)}
                      </p>
                    </div>
                    <div className="hidden sm:block">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        Debit
                      </p>
                      <p className="text-sm font-medium text-blue-600">
                        {formatMoney(worker.totalDebit)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        Balance
                      </p>
                      <p
                        className={cn(
                          "text-base font-semibold",
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
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}