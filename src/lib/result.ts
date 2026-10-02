/**
 * Ledrix — Result Type.
 *
 * Business logic માં exceptions નહીં — explicit success/failure.
 * Server Actions અને API routes માં consistent error handling.
 */

export type Result<T, E = string> =
  | { ok: true; value: T }
  | { ok: false; error: E };

export const Ok = <T>(value: T): Result<T, never> => ({
  ok: true,
  value,
});

export const Err = <E>(error: E): Result<never, E> => ({
  ok: false,
  error,
});

export function isOk<T, E>(
  result: Result<T, E>
): result is { ok: true; value: T } {
  return result.ok;
}

export function isErr<T, E>(
  result: Result<T, E>
): result is { ok: false; error: E } {
  return !result.ok;
}

/**
 * Unwrap value — throws if error. Use only when you're sure.
 */
export function unwrap<T, E>(result: Result<T, E>): T {
  if (!result.ok) {
    throw new Error(
      `Result unwrap failed: ${JSON.stringify(result.error)}`
    );
  }
  return result.value;
}