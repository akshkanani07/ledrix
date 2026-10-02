"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Pencil, Trash2, Search, Phone } from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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

import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/money";
import { deleteWorkerAction } from "../actions/worker.actions";
import type { WorkerListItem } from "../types/worker.types";

interface WorkerListProps {
  workers: WorkerListItem[];
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

export function WorkerList({ workers }: WorkerListProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<WorkerListItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filtered = workers.filter((w) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      w.name.toLowerCase().includes(q) ||
      (w.mobile?.toLowerCase().includes(q) ?? false)
    );
  });

  async function handleDelete() {
    if (!deleteTarget) return;
    setIsDeleting(true);

    const result = await deleteWorkerAction(deleteTarget.id);
    setIsDeleting(false);

    if (result.success) {
      toast.success(result.message ?? "Worker deleted");
      setDeleteTarget(null);
      router.refresh();
    } else {
      toast.error(result.message ?? "Failed to delete");
    }
  }

  function getInitials(name: string) {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }

  function getBalanceInfo(balance: string) {
    const num = Number(balance);
    if (num > 0) {
      return {
        label: "You owe",
        className: "text-emerald-600 font-semibold",
      };
    }
    if (num < 0) {
      return {
        label: "Owes you",
        className: "text-blue-600 font-semibold",
      };
    }
    return {
      label: "Settled",
      className: "text-muted-foreground font-medium",
    };
  }

  return (
    <>
      {/* ─── Search bar ─────────────────────────────── */}
      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search by name or mobile..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-10 pl-9"
        />
      </div>

      {/* ─── Mobile: cards ──────────────────────────── */}
      <div className="space-y-3 md:hidden">
        {filtered.map((worker) => {
          const balanceInfo = getBalanceInfo(worker.runningBalance);
          return (
            <div
              key={worker.id}
              className="rounded-xl border bg-card p-4 transition-all hover:border-zinc-300 hover:shadow-sm"
            >
              <Link href={`/dashboard/workers/${worker.id}`} className="block">
                <div className="flex items-center gap-3">
                  <Avatar className="size-11">
                    {worker.photo && (
                      <AvatarImage src={worker.photo} alt={worker.name} />
                    )}
                    <AvatarFallback className="bg-zinc-900 text-xs font-medium text-white">
                      {getInitials(worker.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {worker.name}
                    </p>
                    {worker.mobile && (
                      <p className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Phone className="size-3" />
                        {worker.mobile}
                      </p>
                    )}
                  </div>
                  <Badge
                    variant="outline"
                    className={STATUS_CONFIG[worker.status].className}
                  >
                    {STATUS_CONFIG[worker.status].label}
                  </Badge>
                </div>

                <div className="mt-3 flex items-center justify-between border-t pt-3">
                  <span className="text-xs text-muted-foreground">
                    {worker.transactionCount}{" "}
                    {worker.transactionCount === 1 ? "entry" : "entries"}
                  </span>
                  <div className="text-right">
                    <p className={cn("text-sm", balanceInfo.className)}>
                      {formatMoney(worker.runningBalance)}
                    </p>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      {balanceInfo.label}
                    </p>
                  </div>
                </div>
              </Link>

              <div className="mt-3 flex items-center gap-2 border-t pt-3">
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="h-8 flex-1"
                >
                  <Link href={`/dashboard/workers/${worker.id}/edit`}>
                    <Pencil className="mr-1.5 size-3.5" />
                    Edit
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 flex-1 text-destructive hover:bg-destructive/5 hover:text-destructive"
                  onClick={() => setDeleteTarget(worker)}
                >
                  <Trash2 className="mr-1.5 size-3.5" />
                  Delete
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ─── Desktop: table ─────────────────────────── */}
      <div className="hidden overflow-hidden rounded-xl border bg-card md:block">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[40%]">Worker</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Entries</TableHead>
              <TableHead className="text-right">Balance</TableHead>
              <TableHead className="w-[140px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((worker) => {
              const balanceInfo = getBalanceInfo(worker.runningBalance);
              return (
                <TableRow key={worker.id}>
                  <TableCell>
                    <Link
                      href={`/dashboard/workers/${worker.id}`}
                      className="flex items-center gap-3"
                    >
                      <Avatar className="size-9">
                        {worker.photo && (
                          <AvatarImage src={worker.photo} alt={worker.name} />
                        )}
                        <AvatarFallback className="bg-zinc-900 text-[10px] font-medium text-white">
                          {getInitials(worker.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {worker.name}
                        </p>
                        {worker.mobile && (
                          <p className="truncate text-xs text-muted-foreground">
                            {worker.mobile}
                          </p>
                        )}
                      </div>
                    </Link>
                  </TableCell>

                  <TableCell>
                    <Badge
                      variant="outline"
                      className={STATUS_CONFIG[worker.status].className}
                    >
                      {STATUS_CONFIG[worker.status].label}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-right text-sm text-muted-foreground">
                    {worker.transactionCount}
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex flex-col items-end">
                      <span className={cn("text-sm", balanceInfo.className)}>
                        {formatMoney(worker.runningBalance)}
                      </span>
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        {balanceInfo.label}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        asChild
                        variant="ghost"
                        size="icon"
                        className="size-8"
                      >
                        <Link
                          href={`/dashboard/workers/${worker.id}/edit`}
                          aria-label="Edit worker"
                        >
                          <Pencil className="size-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => setDeleteTarget(worker)}
                        aria-label="Delete worker"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* ─── Delete confirmation ──────────────────────── */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete worker?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{deleteTarget?.name}</strong> will be moved to trash. You
              can restore them later. Historical ledger entries are kept.
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