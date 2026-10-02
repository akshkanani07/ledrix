import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { prisma } from "@/lib/prisma";
import { serverEnv } from "@/lib/env";

/**
 * Ledrix — Better Auth server instance.
 *
 * Features:
 *  - Email + Password
 *  - Google OAuth
 *  - Session management (cookie-based, secure)
 *  - Remember me (default 30 days)
 */
export const auth = betterAuth({
  appName: "Ledrix",
  baseURL: serverEnv.BETTER_AUTH_URL,
  secret: serverEnv.BETTER_AUTH_SECRET,

  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  // ─── Email + Password ───────────────────────────────────
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // V1: skip email verification
    autoSignIn: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
  },

  // ─── Google OAuth (conditional) ────────────────────────
  socialProviders: {
    ...(serverEnv.GOOGLE_CLIENT_ID && serverEnv.GOOGLE_CLIENT_SECRET
      ? {
          google: {
            clientId: serverEnv.GOOGLE_CLIENT_ID,
            clientSecret: serverEnv.GOOGLE_CLIENT_SECRET,
          },
        }
      : {}),
  },

  // ─── Session config ────────────────────────────────────
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days
    updateAge: 60 * 60 * 24, // refresh once per day
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 min client cache
    },
  },

  // ─── Advanced security ─────────────────────────────────
  advanced: {
    useSecureCookies: serverEnv.NODE_ENV === "production",
    defaultCookieAttributes: {
      sameSite: "lax",
      httpOnly: true,
      secure: serverEnv.NODE_ENV === "production",
    },
  },

  // ─── Database hooks (auto-provision workspace) ────────
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          // Auto-create default workspace for new user
          try {
            const { workspaceService } = await import(
              "@/features/workspace/services/workspace.service"
            );

            await workspaceService.createDefaultForUser({
              userId: user.id,
              userName: user.name,
              userEmail: user.email,
            });
          } catch (error) {
            // Log but don't fail signup
            console.error("Failed to create default workspace:", error);
          }
        },
      },
    },
  },

  // ─── Next.js integration (Server Actions cookies) ─────
  plugins: [nextCookies()],
});

export type Auth = typeof auth;