import { z } from "zod";

export const workspaceUpdateSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(80, "Name is too long")
    .trim(),

  description: z
    .string()
    .max(500, "Description is too long")
    .optional()
    .or(z.literal("")),

  currency: z.enum(["INR", "USD", "EUR", "GBP"]).default("INR"),

  timezone: z
    .string()
    .min(1)
    .default("Asia/Kolkata"),
});

export const profileUpdateSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(80, "Name is too long")
    .trim(),
});

export type WorkspaceUpdateInput = z.infer<typeof workspaceUpdateSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;