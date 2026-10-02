import type { Metadata } from "next";
import Link from "next/link";
import {
  TrendingUp,
  TrendingDown,
  Users,
  Receipt,
  BarChart3,
  ArrowUpRight,
  Wallet,
  Hammer,
} from "lucide-react";

import { requireWorkspace } from "@/features/workspace/services/session-workspace";
import { analyticsService } from "@/features/dashboard/services/analytics.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Analytics",
  description: "Business insights and trends",
};

export default async function AnalyticsPage() {
  const workspace = await requireWorkspace();

  const [overview, monthlyTrend, topWorkers, weeklyActivity] =
    await Promise.all([
      analyticsService.getOverview(workspace.id),
      analyticsService.getMonthlyTrend(workspace.id, 6),
      analyticsService.getTopWorkers(workspace.id, 5),
      analyticsService.getWeeklyActivity(workspace.id),
    ]);

  const maxMonthly = Math.max(
    ...monthlyTrend.map((m) => Math.max(m.work, m.payment, 100)),
    100
  );
  const maxWeekly = Math.max(...weeklyActivity.map((w) => w.count), 1);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight lg:text-3xl">
          Analytics
        </h1>
        <p className="text-sm text-muted-foreground">
          Business insights for {workspace.name}
        </p>
      </div>

      {/* KPI cards */}
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
              <p className="text-xl font-semibold">{overview.totalWorkers}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3 p-5">
            <div className="rounded-lg bg-purple-50 p-2.5">
              <Receipt className="size-4 text-purple-600" />
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Transactions
              </p>
              <p className="text-xl font-semibold">
                {overview.totalTransactions}
              </p>
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
                {formatMoney(overview.totalOwed)}
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
                {formatMoney(overview.totalOwes)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* All-time totals */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <Hammer className="size-3.5" />
              All-Time Work
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-emerald-600">
              {formatMoney(overview.allTimeWork)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <Wallet className="size-3.5" />
              All-Time Payments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-blue-600">
              {formatMoney(overview.allTimePayment)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <TrendingDown className="size-3.5" />
              All-Time Advances
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-amber-600">
              {formatMoney(overview.allTimeAdvance)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <TrendingUp className="size-3.5" />
              All-Time Deductions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-purple-600">
              {formatMoney(overview.allTimeDeduction)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Monthly trend */}
      <Card>
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <BarChart3 className="size-4 text-muted-foreground" />
            Monthly Trend (Last 6 Months)
          </CardTitle>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Work vs Payments comparison
          </p>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {monthlyTrend.map((month) => (
              <div key={month.month} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium">{month.label}</span>
                  <span className="text-muted-foreground">
                    {formatMoney(month.work + month.payment)}
                  </span>
                </div>
                <div className="flex gap-1">
                  <div
                    className="h-2 rounded-full bg-emerald-500 transition-all"
                    style={{
                      width: `${(month.work / maxMonthly) * 50}%`,
                    }}
                  />
                  <div
                    className="h-2 rounded-full bg-blue-500 transition-all"
                    style={{
                      width: `${(month.payment / maxMonthly) * 50}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center gap-4 border-t pt-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="size-2 rounded-full bg-emerald-500" />
              Work
            </div>
            <div className="flex items-center gap-2">
              <div className="size-2 rounded-full bg-blue-500" />
              Payments
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Weekly activity */}
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="text-sm font-semibold">
              Weekly Activity
            </CardTitle>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Last 7 days transaction count
            </p>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex items-end justify-between gap-2">
              {weeklyActivity.map((day) => (
                <div
                  key={day.day}
                  className="flex flex-1 flex-col items-center gap-2"
                >
                  <div className="flex h-24 w-full items-end">
                    <div
                      className={cn(
                        "w-full rounded-t-md transition-all",
                        day.count > 0 ? "bg-emerald-500" : "bg-zinc-200"
                      )}
                      style={{
                        height: `${Math.max(
                          (day.count / maxWeekly) * 100,
                          5
                        )}%`,
                      }}
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                      {day.label}
                    </p>
                    <p className="text-xs font-semibold">{day.count}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top workers */}
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="text-sm font-semibold">
              Top Workers by Balance
            </CardTitle>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Highest outstanding balances
            </p>
          </CardHeader>
          <CardContent className="p-0">
            {topWorkers.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <p className="text-sm text-muted-foreground">
                  No outstanding balances
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {topWorkers.map((worker, idx) => {
                  const isOwed = worker.balance > 0;

                  return (
                    <Link
                      key={worker.id}
                      href={`/dashboard/workers/${worker.id}`}
                      className="group flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-muted/30"
                    >
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                        {idx + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {worker.name}
                        </p>
                        {worker.mobile && (
                          <p className="truncate text-xs text-muted-foreground">
                            {worker.mobile}
                          </p>
                        )}
                      </div>
                      <div className="shrink-0 text-right">
                        <p
                          className={cn(
                            "text-sm font-semibold",
                            isOwed ? "text-emerald-600" : "text-blue-600"
                          )}
                        >
                          {formatMoney(Math.abs(worker.balance))}
                        </p>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                          {isOwed ? "You owe" : "Owes you"}
                        </p>
                      </div>
                      <ArrowUpRight className="size-3.5 text-muted-foreground/40 opacity-0 transition-opacity group-hover:opacity-100" />
                    </Link>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}