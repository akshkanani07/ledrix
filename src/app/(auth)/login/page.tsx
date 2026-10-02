import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";

import { LoginForm } from "@/features/auth/components/login-form";
import { getServerSession } from "@/lib/session";
import { ROUTES } from "@/config/routes";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your Ledrix workspace",
};

export default async function LoginPage() {
  const session = await getServerSession();
  if (session) redirect(ROUTES.dashboard);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
        <p className="text-sm text-muted-foreground">
          Sign in to continue to your workspace
        </p>
      </div>

      <Suspense fallback={<div className="h-72" />}>
        <LoginForm />
      </Suspense>

    </div>
  );
}