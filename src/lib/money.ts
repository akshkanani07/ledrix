import { Prisma } from "@prisma/client";

/**
 * Ledrix — Money utilities.
 * Float NEVER — Decimal only (banker's rounding).
 */

export function toDecimal(value: number | string): Prisma.Decimal {
  return new Prisma.Decimal(value);
}

export function formatMoney(
  value: Prisma.Decimal | number | string,
  currency = "INR"
): string {
  const num = typeof value === "object" ? value.toNumber() : Number(value);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

/**
 * Calculate running balance from transactions.
 * Convention:
 *   WORK → credit to worker (owner owes more)
 *   DEDUCTION → credit to owner (reduces owed)
 *   PAYMENT → debit (owner paid)
 *   ADVANCE → debit (given ahead)
 */
export function calculateRunningBalance(
  openingBalance: Prisma.Decimal | number,
  transactions: Array<{
    type: "WORK" | "PAYMENT" | "ADVANCE" | "DEDUCTION";
    amount: Prisma.Decimal | number;
  }>
): Prisma.Decimal {
  let balance = new Prisma.Decimal(openingBalance);

  for (const tx of transactions) {
    const amt = new Prisma.Decimal(tx.amount);
    switch (tx.type) {
      case "WORK":
        balance = balance.add(amt);
        break;
      case "DEDUCTION":
        balance = balance.sub(amt);
        break;
      case "PAYMENT":
      case "ADVANCE":
        balance = balance.sub(amt);
        break;
    }
  }

  return balance;
}