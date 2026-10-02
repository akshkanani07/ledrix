import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Phone,
  Calendar,
  TrendingUp,
  TrendingDown,
  IndianRupee,
  Hammer,
  Wallet,
  Receipt,
  Download,
  Share2,
} from "lucide-react";

import { requireWorkspace } from "@/features/workspace/services/session-workspace";
import { ledgerService } from "@/features/ledger/services/ledger.service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatMoney } from "@/lib/money";
import { ROUTES } from "@/config/routes";
import { cn } from "@/lib/utils";

interface LedgerDetailPageProps {
  params: Promise<{ workerId: string }>;
}

export async function generateMetadata({
  params,
}: LedgerDetailPageProps): Promise<Metadata> {
  const { workerId } = await params;
  const workspace = await requireWorkspace();
  const ledger = await ledgerService.getWorkerLedger({
    workspaceId: workspace.id,
    workerId,
  });

  return {
    title: ledger ? `Ledger · ${ledger.worker.name}` : "Ledger",
  };
}

const TYPE_CONFIG = {
  WORK: {
    label: "Work",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: Hammer,
  },
  PAYMENT: {
    label: "Payment",
    className: "bg-blue-50 text-blue-700 border-blue-200",
    icon: Wallet,
  },
  ADVANCE: {
    label: "Advance",
    className: "bg-amber-50 text-amber-700 border-amber-200",
    icon: TrendingDown,
  },
  DEDUCTION: {
    label: "Deduction",
    className: "bg-purple-50 text-purple-700 border-purple-200",
    icon: TrendingUp,
  },
} as const;

export default async function LedgerDetailPage({
  params,
}: LedgerDetailPageProps) {
  const { workerId } = await params;
  const workspace = await requireWorkspace();

  const ledger = await ledgerService.getWorkerLedger({
    workspaceId: workspace.id,
    workerId,
  });

  if (!ledger) {
    notFound();
  }

  const { worker, entries, finalBalance } = ledger;
  const balance = Number(finalBalance);
  const isOwed = balance > 0;
  const owes = balance < 0;

  const initials = worker.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  // Totals
  const totals = entries.reduce(
    (acc, e) => {
      const amt = Number(e.amount);
      if (e.type === "WORK" || e.type === "DEDUCTION") {
        acc.credit += amt;
      } else {
        acc.debit += amt;
      }
      acc.count += 1;
      return acc;
    },
    { credit: 0, debit: 0, count: 0 }
  );

  return (
    <div className="space-y-6">
      {/* ─── Back ─────────────────────────────────────── */}
      <Button asChild variant="ghost" size="sm" className="-ml-2 h-8">
        <Link href={ROUTES.ledger}>
          <ArrowLeft className="mr-1.5 size-4" />
          Back to Ledger
        </Link>
      </Button>

      {/* ─── Header ───────────────────────────────────── */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex items-start gap-4">
          <Avatar className="size-14">
            {worker.photo && (
              <AvatarImage src={worker.photo} alt={worker.name} />
            )}
            <AvatarFallback className="bg-zinc-900 text-base font-medium text-white">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="space-y-1.5">
            <h1 className="text-2xl font-semibold tracking-tight lg:text-3xl">
              {worker.name}
            </h1>
            <div className="flex flex-col gap-1 text-sm text-muted-foreground">
              {worker.mobile && (
                <span className="flex items-center gap-1.5">
                  <Phone className="size-3.5" />
                  {worker.mobile}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Calendar className="size-3.5" />
                Added {formatDate(worker.createdAt)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-9"
            disabled
            title="PDF export — coming soon"
          >
            <Download className="mr-1.5 size-4" />
            PDF
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-9"
            disabled
            title="WhatsApp share — coming soon"
          >
            <Share2 className="mr-1.5 size-4" />
            Share
          </Button>
          <Button
            asChild
            size="sm"
            className="h-9 bg-zinc-900 text-white hover:bg-zinc-800"
          >
            <Link href={`${ROUTES.transactionNew}?workerId=${worker.id}`}>
              <Receipt className="mr-1.5 size-4" />
              Add Entry
            </Link>
          </Button>
        </div>
      </div>

      {/* ─── Balance card ─────────────────────────────── */}
      <Card
        className={cn(
          isOwed && "border-emerald-200 bg-emerald-50/50",
          owes && "border-blue-200 bg-blue-50/50"
        )}
      >
        <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "rounded-lg p-2.5",
                isOwed && "bg-emerald-100",
                owes && "bg-blue-100",
                !isOwed && !owes && "bg-muted"
              )}
            >
              {isOwed ? (
                <TrendingUp className="size-5 text-emerald-600" />
              ) : owes ? (
                <TrendingDown className="size-5 text-blue-600" />
              ) : (
                <IndianRupee className="size-5 text-muted-foreground" />
              )}
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {isOwed ? "You Owe Worker" : owes ? "Worker Owes You" : "Balance"}
              </p>
              <p className="mt-0.5 text-2xl font-semibold tracking-tight">
                {formatMoney(Math.abs(balance))}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 border-t pt-4 sm:border-l sm:border-t-0 sm:pl-6 sm:pt-0">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Opening
              </p>
              <p className="text-sm font-medium">
                {formatMoney(worker.openingBalance)}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Credit
              </p>
              <p className="text-sm font-medium text-emerald-600">
                +{formatMoney(totals.credit)}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Debit
              </p>
              <p className="text-sm font-medium text-blue-600">
                -{formatMoney(totals.debit)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ─── Ledger entries ───────────────────────────── */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="text-sm font-semibold">
              Ledger Entries
            </CardTitle>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {totals.count === 0
                ? "No entries yet"
                : `${totals.count} entr${
                    totals.count === 1 ? "y" : "ies"
                  } · chronological order`}
            </p>
          </div>
        </CardHeader>

        <Separator />

        {entries.length === 0 ? (
          <CardContent className="p-0">
            <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                <Receipt className="size-5 text-muted-foreground" />
              </div>
              <p className="mt-3 text-sm font-medium">No ledger entries</p>
              <p className="mt-1 max-w-xs text-xs text-muted-foreground">
                Record work, payments, advances, or deductions to see the
                running ledger.
              </p>
              <Button asChild size="sm" className="mt-4 h-8">
                <Link href={`${ROUTES.transactionNew}?workerId=${worker.id}`}>
                  <Receipt className="mr-1.5 size-3.5" />
                  Add first entry
                </Link>
              </Button>
            </div>
          </CardContent>
        ) : (
          <>
            {/* ─── Mobile cards ──────────────────────── */}
            <div className="space-y-2 p-4 md:hidden">
              {/* Opening balance row */}
              <div className="rounded-lg border bg-muted/30 p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Opening Balance
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(worker.createdAt)}
                    </p>
                  </div>
                  <p className="text-sm font-semibold">
                    {formatMoney(worker.openingBalance)}
                  </p>
                </div>
              </div>

              {entries.map((entry) => {
                const config = TYPE_CONFIG[entry.type];
                return (
                  <div key={entry.id} className="rounded-lg border bg-card p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <Badge variant="outline" className={config.className}>
                          {config.label}
                        </Badge>
                        <p className="mt-1.5 truncate text-sm font-medium">
                          {entry.workName ?? entry.reason}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {formatDate(entry.date)}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-sm font-semibold">
                          {formatMoney(entry.amount)}
                        </p>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                          Bal
                        </p>
                        <p className="text-xs font-medium">
                          {formatMoney(entry.balanceAfter)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ─── Desktop table ─────────────────────── */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead className="text-right">Credit</TableHead>
                    <TableHead className="text-right">Debit</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Opening row */}
                  <TableRow className="bg-muted/30">
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(worker.createdAt)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-zinc-100 text-zinc-700 border-zinc-200">
                        Opening
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      Opening balance
                    </TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground">
                      —
                    </TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground">
                      —
                    </TableCell>
                    <TableCell className="text-right text-sm font-semibold">
                      {formatMoney(worker.openingBalance)}
                    </TableCell>
                  </TableRow>

                  {entries.map((entry) => {
                    const config = TYPE_CONFIG[entry.type];
                    const isCredit =
                      entry.type === "WORK" || entry.type === "DEDUCTION";

                    return (
                      <TableRow key={entry.id}>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(entry.date)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={config.className}>
                            {config.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-[300px]">
                          <p className="truncate text-sm font-medium">
                            {entry.workName ?? entry.reason}
                          </p>
                          {entry.workName && (
                            <p className="truncate text-xs text-muted-foreground">
                              {entry.reason}
                              {entry.rate && entry.pieces && (
                                <> · {entry.pieces} × ₹{entry.rate}</>
                              )}
                            </p>
                          )}
                        </TableCell>
                        <TableCell className="text-right text-sm font-medium text-emerald-600">
                          {isCredit ? formatMoney(entry.amount) : "—"}
                        </TableCell>
                        <TableCell className="text-right text-sm font-medium text-blue-600">
                          {!isCredit ? formatMoney(entry.amount) : "—"}
                        </TableCell>
                        <TableCell className="text-right text-sm font-semibold">
                          {formatMoney(entry.balanceAfter)}
                        </TableCell>
                      </TableRow>
                    );
                  })}

                  {/* Totals row */}
                  <TableRow className="border-t-2 bg-muted/30">
                    <TableCell colSpan={3} className="text-sm font-semibold">
                      Totals
                    </TableCell>
                    <TableCell className="text-right text-sm font-semibold text-emerald-600">
                      {formatMoney(totals.credit)}
                    </TableCell>
                    <TableCell className="text-right text-sm font-semibold text-blue-600">
                      {formatMoney(totals.debit)}
                    </TableCell>
                    <TableCell className="text-right text-sm font-semibold">
                      {formatMoney(finalBalance)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}