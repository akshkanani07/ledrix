import type { LoginInput, RegisterInput } from "../schemas/auth.schema";

/**
 * Ledrix — Auth feature types.
 */

export type { LoginInput, RegisterInput };

export interface AuthActionResult {
  success: boolean;
  message?: string;
  fieldErrors?: Record<string, string[]>;
}