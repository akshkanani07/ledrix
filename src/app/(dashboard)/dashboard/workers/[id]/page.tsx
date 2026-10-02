import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Phone,
  MapPin,
  FileText,
  Pencil,
  Calendar,
  TrendingUp,
  TrendingDown,
  Receipt,
  IndianRupee,
  Hammer,
  Wallet,
} from "lucide-react";

import { requireWorkspace } from "@/features/workspace/services/session-workspace";
import { workerService } from "@/features/workers/services/worker.service";
import { transactionService } from "@/features/transactions/services/transaction.service";
import { toWorkerDetail } from "@/features/workers/types/worker.types";
import { toTransactionListItem } from "@/features/transactions/types/transaction.types";
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

interface WorkerDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: WorkerDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const workspace = await requireWorkspace();
  const worker = await workerService.getById({
    workspaceId: workspace.id,
    id,
  });

  return {
    title: worker?.name ?? "Worker",
    description: worker ? `Ledger for ${worker.name}` : "Worker details",
  };
}

const STATUS_CONFIG = {
  ACTIVE: {
    label: "Active",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  INACTIVE: {
    label: "Inactive",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  ARCHIVED: {
    label: "Archived",
    className: "bg-zinc-100 text-zinc-700 border-zinc-200",
  },
} as const;

const TX_TYPE_CONFIG = {
  WORK: {
    label: "Work",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  PAYMENT: {
    label: "Payment",
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
  ADVANCE: {
    label: "Advance",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  DEDUCTION: {
    label: "Deduction",
    className: "bg-purple-50 text-purple-700 border-purple-200",
  },
} as const;

export default async function WorkerDetailPage({
  params,
}: WorkerDetailPageProps) {
  const { id } = await params;
  const workspace = await requireWorkspace();

  const rawWorker = await workerService.getById({
    workspaceId: workspace.id,
    id,
  });

  if (!rawWorker) {
    notFound();
  }

  const worker = toWorkerDetail(rawWorker);

  // ✅ Compute running balance + fetch transactions
  const ledger = await transactionService.getWorkerLedger({
    workspaceId: workspace.id,
    workerId: worker.id,
  });

  const balance = ledger ? Number(ledger.finalBalance) : Number(worker.openingBalance);
  const isOwedToWorker = balance > 0;
  const isWorkerOwes = balance < 0;

  // Serialize transactions for client (reverse chronological for display)
  const transactions = ledger
    ? [...ledger.items]
        .reverse()
        .map(({ tx, runningBalance }) =>
                    toTransactionListItem(
            tx as Parameters<typeof toTransactionListItem>[0],
            runningBalance
          )
        )
    : [];

  const initials = worker.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <div className="space-y-6">
      {/* ─── Back ─────────────────────────────────────── */}
      <Button asChild variant="ghost" size="sm" className="-ml-2 h-8">
        <Link href={ROUTES.workers}>
          <ArrowLeft className="mr-1.5 size-4" />
          Back to Workers
        </Link>
      </Button>

      {/* ─── Header ───────────────────────────────────── */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex items-start gap-4">
          <Avatar className="size-16">
            {worker.photo && (
              <AvatarImage src={worker.photo} alt={worker.name} />
            )}
            <AvatarFallback className="bg-zinc-900 text-lg font-medium text-white">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight lg:text-3xl">
                {worker.name}
              </h1>
              <Badge
                variant="outline"
                className={STATUS_CONFIG[worker.status].className}
              >
                {STATUS_CONFIG[worker.status].label}
              </Badge>
            </div>

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
          <Button asChild variant="outline" size="sm" className="h-9">
            <Link href={`/dashboard/workers/${worker.id}/edit`}>
              <Pencil className="mr-1.5 size-4" />
              Edit
            </Link>
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

      {/* ─── Running balance card ─────────────────────── */}
      <Card
        className={cn(
          isOwedToWorker && "border-emerald-200 bg-emerald-50/50",
          isWorkerOwes && "border-blue-200 bg-blue-50/50"
        )}
      >
        <CardContent className="flex items-center justify-between p-5">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "rounded-lg p-2.5",
                isOwedToWorker && "bg-emerald-100",
                isWorkerOwes && "bg-blue-100",
                !isOwedToWorker && !isWorkerOwes && "bg-muted"
              )}
            >
              {isOwedToWorker ? (
                <TrendingUp className="size-5 text-emerald-600" />
              ) : isWorkerOwes ? (
                <TrendingDown className="size-5 text-blue-600" />
              ) : (
                <IndianRupee className="size-5 text-muted-foreground" />
              )}
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {isOwedToWorker
                  ? "You Owe Worker"
                  : isWorkerOwes
                  ? "Worker Owes You"
                  : "Running Balance"}
              </p>
              <p className="mt-0.5 text-2xl font-semibold tracking-tight">
                {formatMoney(Math.abs(balance))}
              </p>
            </div>
          </div>

          {Number(worker.openingBalance) !== 0 && (
            <div className="hidden text-right md:block">
              <p className="text-xs text-muted-foreground">Opening</p>
              <p className="text-sm font-medium">
                {formatMoney(worker.openingBalance)}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ─── Info grid ────────────────────────────────── */}
      {(worker.address || worker.notes) && (
        <div className="grid gap-4 md:grid-cols-2">
          {worker.address && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-medium">
                  <MapPin className="size-4 text-muted-foreground" />
                  Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                  {worker.address}
                </p>
              </CardContent>
            </Card>
          )}

          {worker.notes && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-medium">
                  <FileText className="size-4 text-muted-foreground" />
                  Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                  {worker.notes}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* ─── Transaction History ──────────────────────── */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="text-sm font-semibold">
              Transaction History
            </CardTitle>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {transactions.length === 0
                ? "All work entries, payments, advances & deductions"
                : `${transactions.length} entr${
                    transactions.length === 1 ? "y" : "ies"
                  } recorded`}
            </p>
          </div>
          <Button asChild size="sm" variant="outline" className="h-8">
            <Link href={`${ROUTES.transactionNew}?workerId=${worker.id}`}>
              <Receipt className="mr-1.5 size-3.5" />
              Add Entry
            </Link>
          </Button>
        </CardHeader>
        <Separator />

        {transactions.length === 0 ? (
          <CardContent className="p-0">
            <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                <Receipt className="size-5 text-muted-foreground" />
              </div>
              <p className="mt-3 text-sm font-medium">No transactions yet</p>
              <p className="mt-1 max-w-xs text-xs text-muted-foreground">
                Record a work entry, payment, advance, or deduction for this
                worker to see their running ledger.
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
            {/* ─── Mobile: cards ──────────────────────── */}
            <div className="space-y-2 p-4 md:hidden">
              {transactions.map((tx) => {
                const config = TX_TYPE_CONFIG[tx.type];
                return (
                  <div
                    key={tx.id}
                    className="rounded-lg border bg-card p-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <Badge variant="outline" className={config.className}>
                          {config.label}
                        </Badge>
                        <p className="mt-1.5 truncate text-sm font-medium">
                          {tx.workName ?? tx.reason}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {formatDate(tx.date)}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-sm font-semibold">
                          {formatMoney(tx.amount)}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          Bal: {formatMoney(tx.runningBalance)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ─── Desktop: table ─────────────────────── */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((tx) => {
                    const config = TX_TYPE_CONFIG[tx.type];
                    return (
                      <TableRow key={tx.id}>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(tx.date)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={config.className}
                          >
                            {config.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-[300px]">
                          <p className="truncate text-sm font-medium">
                            {tx.workName ?? tx.reason}
                          </p>
                          {tx.workName && (
                            <p className="truncate text-xs text-muted-foreground">
                              {tx.reason}
                              {tx.rate && tx.pieces && (
                                <> · {tx.pieces} × ₹{tx.rate}</>
                              )}
                            </p>
                          )}
                        </TableCell>
                        <TableCell className="text-right text-sm font-semibold">
                          {formatMoney(tx.amount)}
                        </TableCell>
                        <TableCell className="text-right text-sm text-muted-foreground">
                          {formatMoney(tx.runningBalance)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}