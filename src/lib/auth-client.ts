"use client";

import { createAuthClient } from "better-auth/react";
import { clientEnv } from "@/lib/env";

/**
 * Ledrix — Better Auth client instance.
 * Browser-side hooks: useSession, signIn, signUp, signOut.
 */
export const authClient = createAuthClient({
  baseURL: clientEnv.NEXT_PUBLIC_APP_URL,
});

export const {
  signIn,
  signUp,
  signOut,
  useSession,
  getSession,
} = authClient;