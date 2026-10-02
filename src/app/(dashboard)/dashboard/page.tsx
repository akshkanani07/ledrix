import {
  Users,
  Hammer,
  Wallet,
  TrendingUp,
  ArrowUpRight,
  Plus,
} from "lucide-react";
import Link from "next/link";

import { requireSession } from "@/lib/session";
import { getCurrentWorkspace } from "@/features/workspace/services/session-workspace";
import { dashboardService } from "@/features/dashboard/services/dashboard.service";
import { RecentActivity } from "@/features/dashboard/components/recent-activity";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/config/routes";
import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/utils";

export default async function DashboardPage() {
  const session = await requireSession();
  const workspace = await getCurrentWorkspace();

  if (!session?.user) {
    return null;
  }

  const firstName = session.user.name?.split(" ")[0] ?? "there";
  // If no workspace, show setup state
  if (!workspace) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-semibold">Setting up your workspace…</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Please refresh in a moment.
          </p>
        </div>
      </div>
    );
  }

  const [stats, recent] = await Promise.all([
    dashboardService.getStats(workspace.id),
    dashboardService.getRecentActivity(workspace.id, 5),
  ]);

  const STATS = [
    {
      label: "Total Workers",
      value: String(stats.totalWorkers),
      sub:
        stats.activeWorkers === stats.totalWorkers
          ? "All active"
          : `${stats.activeWorkers} active`,
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Today's Work",
      value: formatMoney(stats.todayWork),
      sub:
        stats.todayWorkCount === 0
          ? "No entries today"
          : `${stats.todayWorkCount} ${
              stats.todayWorkCount === 1 ? "entry" : "entries"
            }`,
      icon: Hammer,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Today's Payments",
      value: formatMoney(stats.todayPayments),
      sub:
        stats.todayPaymentsCount === 0
          ? "No payments today"
          : `${stats.todayPaymentsCount} ${
              stats.todayPaymentsCount === 1 ? "payment" : "payments"
            }`,
      icon: Wallet,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "Outstanding Balance",
      value: formatMoney(Math.abs(stats.outstandingBalance.net)),
      sub:
        stats.outstandingBalance.net === 0
          ? "All settled up"
          : stats.outstandingBalance.net > 0
          ? "You owe workers"
          : "Workers owe you",
      icon: TrendingUp,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
  ] as const;

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* ─── Page header ─────────────────────────────────── */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {workspace.name}
          </p>
          <h1 className="text-2xl font-semibold tracking-tight lg:text-3xl">
            Welcome back, {firstName}
          </h1>
          <p className="text-sm text-muted-foreground">
            Here&apos;s your workforce overview for today.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm" className="h-9">
            <Link href={ROUTES.workerNew}>
              <Plus className="mr-1.5 size-4" />
              Add Worker
            </Link>
          </Button>
          <Button
            asChild
            size="sm"
            className="h-9 bg-zinc-900 text-white hover:bg-zinc-800"
          >
            <Link href={ROUTES.transactionNew}>
              <Plus className="mr-1.5 size-4" />
              New Entry
            </Link>
          </Button>
        </div>
      </div>

      {/* ─── Stats grid ──────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="group relative overflow-hidden rounded-xl border bg-card p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div className={cn("rounded-lg p-2", stat.bg)}>
                  <Icon className={cn("size-4", stat.color)} />
                </div>
                <ArrowUpRight className="size-4 text-muted-foreground/40 opacity-0 transition-opacity group-hover:opacity-100" />
              </div>

              <div className="mt-4 space-y-1">
                <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  {stat.label}
                </p>
                <p className="text-2xl font-semibold tracking-tight">
                  {stat.value}
                </p>
                <p className="text-xs text-muted-foreground">{stat.sub}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ─── Two-column section ──────────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Recent activity */}
        <div className="overflow-hidden rounded-xl border bg-card lg:col-span-2">
          <div className="flex items-center justify-between border-b px-5 py-4">
            <div>
              <h2 className="text-sm font-semibold">Recent Activity</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Latest ledger entries
              </p>
            </div>
            <Button asChild variant="ghost" size="sm" className="h-8 text-xs">
              <Link href={ROUTES.transactions}>View all</Link>
            </Button>
          </div>

          <RecentActivity items={recent} />
        </div>

        {/* Quick actions */}
        <div className="rounded-xl border bg-card">
          <div className="border-b px-5 py-4">
            <h2 className="text-sm font-semibold">Quick Actions</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Jump to common tasks
            </p>
          </div>
          <div className="space-y-1 p-3">
            {[
              { label: "Add new worker", href: ROUTES.workerNew, icon: Users },
              {
                label: "Record work entry",
                href: ROUTES.transactionNew,
                icon: Hammer,
              },
              {
                label: "View running ledger",
                href: ROUTES.ledger,
                icon: TrendingUp,
              },
              {
                label: "Generate report",
                href: ROUTES.reports,
                icon: Wallet,
              },
            ].map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.href}
                  href={action.href}
                  className="group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-muted"
                >
                  <div className="rounded-md bg-muted p-1.5 transition-colors group-hover:bg-background">
                    <Icon className="size-3.5 text-muted-foreground" />
                  </div>
                  <span className="text-sm font-medium">{action.label}</span>
                  <ArrowUpRight className="ml-auto size-3.5 text-muted-foreground/40 opacity-0 transition-opacity group-hover:opacity-100" />
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}