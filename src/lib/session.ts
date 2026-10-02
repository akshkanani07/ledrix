import { headers } from "next/headers";
import { cache } from "react";
import { auth } from "@/lib/auth";

/**
 * Ledrix — Server-side session helpers.
 * `cache()` deduplicates calls in same request.
 */

export const getServerSession = cache(async () => {
  return auth.api.getSession({
    headers: await headers(),
  });
});

/**
 * Require session — throws redirect if not logged in.
 * Use in Server Components under (dashboard).
 */
export async function requireSession() {
  const session = await getServerSession();
  if (!session) {
    const { redirect } = await import("next/navigation");
    redirect("/login");
  }
  return session;
}