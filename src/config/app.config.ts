import { clientEnv } from "@/lib/env";

/**
 * Ledrix — App-level configuration constants.
 * Centralized so we can change branding/behavior in one place.
 */
export const APP_CONFIG = {
  name: clientEnv.NEXT_PUBLIC_APP_NAME,
  url: clientEnv.NEXT_PUBLIC_APP_URL,
  tagline: "Smart Workforce Ledger Platform",
  description:
    "Multi-tenant SaaS platform for factories, workshops, and labour-based businesses to manage worker ledgers, payments, advances, and reports.",
  version: "0.1.0",

  // Defaults
  defaultLocale: "en",
  defaultTimezone: "Asia/Kolkata",
  defaultCurrency: "INR",

  // Pagination
  defaultPageSize: 20,
  maxPageSize: 100,

  // Cache TTL (seconds)
  cacheTtl: {
    short: 30,
    medium: 60 * 5,
    long: 60 * 60,
  },
} as const;

export type AppConfig = typeof APP_CONFIG;