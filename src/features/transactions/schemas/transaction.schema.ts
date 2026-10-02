import { z } from "zod";

export const transactionTypes = [
  "WORK",
  "PAYMENT",
  "ADVANCE",
  "DEDUCTION",
] as const;

export const paymentMethods = [
  "CASH",
  "UPI",
  "BANK_TRANSFER",
  "CHEQUE",
  "OTHER",
] as const;

export const transactionCreateSchema = z
  .object({
    workerId: z.string().min(1, "Worker is required"),
    type: z.enum(transactionTypes, {
      required_error: "Transaction type is required",
    }),
    reason: z
      .string()
      .min(2, "Reason is required")
      .max(200, "Reason is too long")
      .trim(),
    workName: z
      .string()
      .max(100, "Work name is too long")
      .optional()
      .or(z.literal("")),
    rate: z.coerce
      .number()
      .min(0, "Rate must be positive")
      .max(1000000, "Rate too high")
      .optional(),
    pieces: z.coerce
      .number()
      .int("Pieces must be whole number")
      .min(0, "Pieces must be positive")
      .max(1000000, "Pieces too high")
      .optional(),
    amount: z.coerce
      .number()
      .positive("Amount must be greater than 0")
      .max(100000000, "Amount too high"),
    paymentMethod: z.enum(paymentMethods).optional(),
    remarks: z
      .string()
      .max(500, "Remarks are too long")
      .optional()
      .or(z.literal("")),
    date: z.string().min(1, "Date is required"),
  })
  .refine(
    (data) => {
      if (data.type === "WORK" && !data.workName) {
        return false;
      }
      return true;
    },
    {
      message: "Work name is required for work entries",
      path: ["workName"],
    }
  );

export const transactionUpdateSchema = transactionCreateSchema;

export type TransactionCreateInput = z.infer<typeof transactionCreateSchema>;
export type TransactionUpdateInput = z.infer<typeof transactionUpdateSchema>;