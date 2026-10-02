import { z } from "zod";

/**
 * Ledrix — Environment Variable Schema
 *
 * Server-side env validation. App crash on startup if invalid
 * instead of mysterious runtime errors.
 */
const serverEnvSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  DATABASE_URL: z.string().url().startsWith("postgres"),

  REDIS_URL: z.string().url(),

  BETTER_AUTH_SECRET: z.string().min(32, {
    message: "BETTER_AUTH_SECRET must be at least 32 characters",
  }),
  BETTER_AUTH_URL: z.string().url(),

  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),

  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),

  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  EMAIL_FROM: z.string().email().optional(),
});

/**
 * Client-side env (exposed to browser). Only NEXT_PUBLIC_* vars.
 */
const clientEnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NEXT_PUBLIC_APP_NAME: z.string().min(1),
});

function formatErrors(
  errors: z.ZodIssue[]
): string {
  return errors
    .map((err) => `  ❌ ${err.path.join(".")}: ${err.message}`)
    .join("\n");
}

// ─── Server env (validated once, cached) ────────────────────
function validateServerEnv() {
  const parsed = serverEnvSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error(
      "\n🚨 Invalid server environment variables:\n" +
        formatErrors(parsed.error.issues) +
        "\n"
    );
    throw new Error("Invalid server environment variables.");
  }

  return parsed.data;
}

// ─── Client env (must be inlined) ───────────────────────────
function validateClientEnv() {
  const parsed = clientEnvSchema.safeParse({
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
  });

  if (!parsed.success) {
    throw new Error(
      "Invalid client environment variables:\n" +
        formatErrors(parsed.error.issues)
    );
  }

  return parsed.data;
}

// ─── Exports ────────────────────────────────────────────────
export const serverEnv =
  typeof window === "undefined" ? validateServerEnv() : ({} as never);

export const clientEnv = validateClientEnv();