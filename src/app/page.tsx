import { redirect } from "next/navigation";

import { getServerSession } from "@/lib/session";
import { ROUTES } from "@/config/routes";

/**
 * Ledrix — Root page.
 * Redirects to dashboard (if logged in) or login (if not).
 */
export default async function HomePage() {
  const session = await getServerSession();

  if (session) {
    redirect(ROUTES.dashboard);
  }

  redirect(ROUTES.login);
}