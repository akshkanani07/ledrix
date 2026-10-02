import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";

import { RegisterForm } from "@/features/auth/components/register-form";
import { getServerSession } from "@/lib/session";
import { ROUTES } from "@/config/routes";

export const metadata: Metadata = {
  title: "Create account",
  description: "Create your Ledrix workspace",
};

export default async function RegisterPage() {
  const session = await getServerSession();
  if (session) redirect(ROUTES.dashboard);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          Create your account
        </h1>
        <p className="text-sm text-muted-foreground">
          Start managing your workforce ledger in minutes
        </p>
      </div>

      <Suspense fallback={<div className="h-96" />}>
        <RegisterForm />
      </Suspense>

    </div>
  );
}