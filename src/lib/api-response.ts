import { NextResponse } from "next/server";
import { ZodError } from "zod";

/**
 * Ledrix — Standardized API response helpers.
 * Every API route returns this shape → consistent client handling.
 */

export type ApiSuccess<T> = {
  success: true;
  data: T;
  message?: string;
};

export type ApiError = {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};

export function ok<T>(
  data: T,
  message?: string,
  status = 200
): NextResponse<ApiSuccess<T>> {
  return NextResponse.json({ success: true, data, message }, { status });
}

export function created<T>(
  data: T,
  message = "Created successfully"
): NextResponse<ApiSuccess<T>> {
  return NextResponse.json({ success: true, data, message }, { status: 201 });
}

export function noContent(): NextResponse {
  return new NextResponse(null, { status: 204 });
}

export function fail(
  code: string,
  message: string,
  status = 400,
  details?: unknown
): NextResponse<ApiError> {
  return NextResponse.json(
    { success: false, error: { code, message, details } },
    { status }
  );
}

// ─── Common shortcuts ────────────────────────────────────────
export const unauthorized = (msg = "Unauthorized") =>
  fail("UNAUTHORIZED", msg, 401);

export const forbidden = (msg = "Forbidden") =>
  fail("FORBIDDEN", msg, 403);

export const notFound = (msg = "Not found") =>
  fail("NOT_FOUND", msg, 404);

export const badRequest = (msg = "Bad request", details?: unknown) =>
  fail("BAD_REQUEST", msg, 400, details);

export const serverError = (msg = "Internal server error") =>
  fail("INTERNAL_ERROR", msg, 500);

export const tooManyRequests = (msg = "Too many requests") =>
  fail("RATE_LIMITED", msg, 429);

// ─── Zod error handler ───────────────────────────────────────
export function handleZodError(error: ZodError) {
  return badRequest(
    "Validation failed",
    error.issues.map((issue) => ({
      path: issue.path.join("."),
      message: issue.message,
    }))
  );
}