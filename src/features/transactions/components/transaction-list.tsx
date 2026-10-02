"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Search,
  Hammer,
  Wallet,
  TrendingDown,
  TrendingUp,
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/money";
import { deleteTransactionAction } from "../actions/transaction.actions";
import type { TransactionListItem } from "../types/transaction.types";

interface TransactionListProps {
  transactions: TransactionListItem[];
}

const TYPE_CONFIG = {
  WORK: {
    label: "Work",
    icon: Hammer,
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  PAYMENT: {
    label: "Payment",
    icon: Wallet,
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
  ADVANCE: {
    label: "Advance",
    icon: TrendingDown,
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  DEDUCTION: {
    label: "Deduction",
    icon: TrendingUp,
    className: "bg-purple-50 text-purple-700 border-purple-200",
  },
} as const;

export function TransactionList({ transactions }: TransactionListProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [deleteTarget, setDeleteTarget] =
    useState<TransactionListItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filtered = transactions.filter((tx) => {
    if (typeFilter !== "ALL" && tx.type !== typeFilter) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      tx.workerName.toLowerCase().includes(q) ||
      tx.reason.toLowerCase().includes(q) ||
      (tx.workName?.toLowerCase().includes(q) ?? false)
    );
  });

  async function handleDelete() {
    if (!deleteTarget) return;
    setIsDeleting(true);

    const result = await deleteTransactionAction(deleteTarget.id);
    setIsDeleting(false);

    if (result.success) {
      toast.success(result.message ?? "Deleted");
      setDeleteTarget(null);
      router.refresh();
    } else {
      toast.error(result.message ?? "Failed to delete");
    }
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <>
      {/* ─── Filters ──────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1 max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by worker or reason..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 pl-9"
          />
        </div>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="h-10 w-full sm:w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Types</SelectItem>
            <SelectItem value="WORK">Work</SelectItem>
            <SelectItem value="PAYMENT">Payment</SelectItem>
            <SelectItem value="ADVANCE">Advance</SelectItem>
            <SelectItem value="DEDUCTION">Deduction</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* ─── Empty search result ──────────────────────── */}
      {filtered.length === 0 && (
        <div className="rounded-xl border bg-card py-12 text-center">
          <p className="text-sm text-muted-foreground">
            No transactions match your filters.
          </p>
        </div>
      )}

      {/* ─── Mobile: cards ────────────────────────────── */}
      {filtered.length > 0 && (
        <div className="space-y-3 md:hidden">
          {filtered.map((tx) => {
            const config = TYPE_CONFIG[tx.type];
            const Icon = config.icon;
            return (
              <div
                key={tx.id}
                className="rounded-xl border bg-card p-4 transition-all hover:border-zinc-300 hover:shadow-sm"
              >
                <Link
                  href={`/dashboard/workers/${tx.workerId}`}
                  className="block"
                >
                  <div className="flex items-start gap-3">
                    <div className={cn("rounded-lg p-2", config.className.split(" ")[0])}>
                      <Icon className={cn("size-4", config.className.split(" ")[1])} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="truncate text-sm font-medium">
                          {tx.workerName}
                        </p>
                        <p className="shrink-0 text-sm font-semibold">
                          {formatMoney(tx.amount)}
                        </p>
                      </div>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {tx.workName ?? tx.reason}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <Badge variant="outline" className={config.className}>
                          {config.label}
                        </Badge>
                        <span className="text-[11px] text-muted-foreground">
                          {formatDate(tx.date)}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>

                {/* Mobile action buttons */}
                <div className="mt-3 flex items-center gap-2 border-t pt-3">
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="h-8 flex-1"
                  >
                    <Link href={`/dashboard/transactions/${tx.id}/edit`}>
                      <Pencil className="mr-1.5 size-3.5" />
                      Edit
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 flex-1 text-destructive hover:bg-destructive/5 hover:text-destructive"
                    onClick={() => setDeleteTarget(tx)}
                  >
                    <Trash2 className="mr-1.5 size-3.5" />
                    Delete
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── Desktop: table ───────────────────────────── */}
      {filtered.length > 0 && (
        <div className="hidden overflow-hidden rounded-xl border bg-card md:block">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Worker</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="w-[80px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((tx) => {
                const config = TYPE_CONFIG[tx.type];
                return (
                  <TableRow key={tx.id}>
                    <TableCell>
                      <Link
                        href={`/dashboard/workers/${tx.workerId}`}
                        className="text-sm font-medium hover:underline"
                      >
                        {tx.workerName}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={config.className}>
                        {config.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[300px]">
                      <p className="truncate text-sm">{tx.reason}</p>
                      {tx.workName && (
                        <p className="truncate text-xs text-muted-foreground">
                          {tx.workName}
                        </p>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(tx.date)}
                    </TableCell>
                    <TableCell className="text-right text-sm font-semibold">
                      {formatMoney(tx.amount)}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8"
                            aria-label="Transaction actions"
                          >
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() =>
                              router.push(`/dashboard/workers/${tx.workerId}`)
                            }
                            className="cursor-pointer"
                          >
                            <Eye className="mr-2 size-4" />
                            View worker
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              router.push(
                                `/dashboard/transactions/${tx.id}/edit`
                              )
                            }
                            className="cursor-pointer"
                          >
                            <Pencil className="mr-2 size-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => setDeleteTarget(tx)}
                            className="cursor-pointer text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 size-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* ─── Delete confirmation ──────────────────────── */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete transaction?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the{" "}
              <strong>{deleteTarget?.type.toLowerCase()}</strong> entry of{" "}
              <strong>{formatMoney(deleteTarget?.amount ?? "0")}</strong> for{" "}
              <strong>{deleteTarget?.workerName}</strong>. Running ledger will
              be recalculated.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}