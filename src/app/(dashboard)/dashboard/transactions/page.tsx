import type { Metadata } from "next";
import Link from "next/link";
import { Plus, Receipt } from "lucide-react";

import { requireWorkspace } from "@/features/workspace/services/session-workspace";
import { transactionService } from "@/features/transactions/services/transaction.service";
import { toTransactionListItem } from "@/features/transactions/types/transaction.types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TransactionList } from "@/features/transactions/components/transaction-list";
import { ROUTES } from "@/config/routes";

export const metadata: Metadata = {
  title: "Transactions",
  description: "All ledger entries",
};

export default async function TransactionsPage() {
  const workspace = await requireWorkspace();

  const { items, total } = await transactionService.list({
    workspaceId: workspace.id,
    page: 1,
    pageSize: 50,
  });

  const transactions = items.map((tx) => toTransactionListItem(tx));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight lg:text-3xl">
            Transactions
          </h1>
          <p className="text-sm text-muted-foreground">
            {total === 0
              ? "All your ledger entries will appear here."
              : `${total} entr${total === 1 ? "y" : "ies"} recorded.`}
          </p>
        </div>

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

      {transactions.length === 0 ? (
        <Card className="border-dashed">
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-muted">
              <Receipt className="size-6 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-base font-semibold">No transactions yet</h3>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Record work entries, payments, advances, or deductions for your
              workers.
            </p>
            <Button asChild size="sm" className="mt-6">
              <Link href={ROUTES.transactionNew}>
                <Plus className="mr-1.5 size-4" />
                Record first entry
              </Link>
            </Button>
          </div>
        </Card>
      ) : (
        <TransactionList transactions={transactions} />
      )}
    </div>
  );
}