export const ROUTES = {
  home: "/",
  login: "/login",
  register: "/register",
  forgotPassword: "/forgot-password",

  dashboard: "/dashboard",

  workers: "/dashboard/workers",
  workerNew: "/dashboard/workers/new",
  workerDetail: (id: string) => `/dashboard/workers/${id}`,

  transactions: "/dashboard/transactions",
  transactionNew: "/dashboard/transactions/new",

  ledger: "/dashboard/ledger",
  ledgerDetail: (workerId: string) => `/dashboard/ledger/${workerId}`,

  reports: "/dashboard/reports",
  analytics: "/dashboard/analytics",

  settings: "/dashboard/settings",
  activityLogs: "/dashboard/activity",
} as const;