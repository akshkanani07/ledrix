import { z } from "zod";

/**
 * Ledrix — Worker validation schemas.
 * Shared between forms + server actions.
 */

export const workerCreateSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(80, "Name is too long")
    .trim(),

  mobile: z
    .string()
    .regex(/^[0-9+\-\s()]{6,20}$/, "Enter a valid mobile number")
    .optional()
    .or(z.literal("")),

  address: z
    .string()
    .max(500, "Address is too long")
    .optional()
    .or(z.literal("")),

  notes: z
    .string()
    .max(1000, "Notes are too long")
    .optional()
    .or(z.literal("")),

  openingBalance: z.coerce
    .number()
    .min(-10000000, "Amount too low")
    .max(10000000, "Amount too high")
    .default(0),

  status: z.enum(["ACTIVE", "INACTIVE", "ARCHIVED"]).default("ACTIVE"),

  photo: z.string().url().optional().or(z.literal("")),
});

export const workerUpdateSchema = workerCreateSchema.partial();

export type WorkerCreateInput = z.infer<typeof workerCreateSchema>;
export type WorkerUpdateInput = z.infer<typeof workerUpdateSchema>;